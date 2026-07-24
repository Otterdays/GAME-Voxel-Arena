#!/usr/bin/env python3
"""
Refactor audit suite for Voxel Arena.

Checks AGENTS.md code-size limits against game/ source:
  - File ≤ 400 lines
  - Function ≤ 50 lines (JS only, brace-based heuristic)
  - Line ≤ 100 chars

Usage:
  python scripts/refactor_audit.py
  python scripts/refactor_audit.py --json
  python scripts/refactor_audit.py --md docs/REFACTOR_AUDIT.md
  python scripts/refactor_audit.py --fail  # exit 1 if any violation
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / "game"

FILE_LIMIT = 400
FUNC_LIMIT = 50
LINE_LIMIT = 100

CONTROL = {
    "if",
    "for",
    "while",
    "switch",
    "catch",
    "else",
    "try",
    "do",
    "with",
    "return",
}

FUNC_PATTERNS = [
    re.compile(r"^\s*(?:async\s+)?function\s+(\w+)\s*\("),
    re.compile(r"^\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{"),
    re.compile(
        r"^\s*(?:async\s+)?(\w+)\s*=\s*(?:async\s+)?"
        r"(?:function\s*\(|\([^)]*\)\s*=>|\w+\s*=>)"
    ),
    re.compile(
        r"^\s*(?:async\s+)?(\w+)\s*=\s*(?:async\s+)?"
        r"\([^)]*\)\s*=>\s*\{"
    ),
    re.compile(
        r"^\s*(?:async\s+)?(\w+)\s*=\s*(?:async\s+)?function\s*\("
    ),
    re.compile(r"^\s*(?:get|set)\s+(\w+)\s*\("),
]


@dataclass
class FuncInfo:
    name: str
    start: int
    end: int
    lines: int


@dataclass
class FileReport:
    path: str
    loc: int
    nonblank: int
    comments: int
    codeish: int
    over_file_limit: bool
    long_line_count: int
    longest_line: int
    long_lines_sample: list
    func_count: int
    max_func: int
    oversized_funcs: list = field(default_factory=list)


def collect_files() -> list[Path]:
    files: list[Path] = []
    src = GAME / "src"
    if src.is_dir():
        for p in sorted(src.rglob("*")):
            if p.is_file() and p.suffix.lower() in {".js", ".css", ".html"}:
                files.append(p)
    for name in ("index.html", "home.html", "style.css"):
        p = GAME / name
        if p.is_file():
            files.append(p)

    seen: set[str] = set()
    uniq: list[Path] = []
    for f in files:
        key = str(f.resolve()).lower()
        if key not in seen:
            seen.add(key)
            uniq.append(f)
    return uniq


def count_commentish(line: str) -> bool:
    s = line.strip()
    return (
        s.startswith("//")
        or s.startswith("/*")
        or s.startswith("*")
        or s.startswith("<!--")
    )


def find_functions(lines: list[str]) -> list[FuncInfo]:
    funcs: list[FuncInfo] = []
    i = 0
    while i < len(lines):
        name = None
        for pat in FUNC_PATTERNS:
            m = pat.match(lines[i])
            if m:
                cand = m.group(1)
                if cand not in CONTROL:
                    name = cand
                break
        if name is None:
            i += 1
            continue

        brace_start = None
        for j in range(i, min(i + 5, len(lines))):
            if "{" in lines[j]:
                brace_start = j
                break

        if brace_start is None:
            funcs.append(FuncInfo(name, i + 1, i + 1, 1))
            i += 1
            continue

        depth = 0
        end = brace_start
        for j in range(brace_start, len(lines)):
            depth += lines[j].count("{") - lines[j].count("}")
            if depth == 0:
                end = j
                break

        funcs.append(FuncInfo(name, i + 1, end + 1, end - i + 1))
        i = end + 1
    return funcs


def analyze_file(path: Path) -> FileReport:
    text = path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    loc = len(lines)
    nonblank = sum(1 for l in lines if l.strip())
    comments = sum(1 for l in lines if count_commentish(l))
    long_lines = [
        (i + 1, len(l)) for i, l in enumerate(lines) if len(l) > LINE_LIMIT
    ]
    longest = max((len(l) for l in lines), default=0)

    funcs: list[FuncInfo] = []
    if path.suffix.lower() == ".js":
        funcs = find_functions(lines)

    oversized = [f for f in funcs if f.lines > FUNC_LIMIT]
    rel = path.relative_to(ROOT).as_posix()

    return FileReport(
        path=rel,
        loc=loc,
        nonblank=nonblank,
        comments=comments,
        codeish=max(0, nonblank - comments),
        over_file_limit=loc > FILE_LIMIT,
        long_line_count=len(long_lines),
        longest_line=longest,
        long_lines_sample=long_lines[:8],
        func_count=len(funcs),
        max_func=max((f.lines for f in funcs), default=0),
        oversized_funcs=[asdict(f) for f in oversized],
    )


def priority(report: FileReport) -> str:
    if report.over_file_limit and report.oversized_funcs:
        return "P0"
    if report.over_file_limit:
        return "P1"
    if report.oversized_funcs:
        return "P2"
    if report.long_line_count >= 10:
        return "P3"
    return "OK"


def run_audit() -> list[FileReport]:
    reports = [analyze_file(p) for p in collect_files()]
    reports.sort(key=lambda r: (-r.loc, r.path))
    return reports


def print_table(reports: list[FileReport]) -> None:
    hdr = (
        f"{'PRI':<3} {'PATH':<48} {'LOC':>5} {'NB':>5} "
        f"{'FUN':>4} {'MAXF':>4} {'LONG':>4}"
    )
    print(hdr)
    print("-" * len(hdr))
    for r in reports:
        pri = priority(r)
        print(
            f"{pri:<3} {r.path:<48} {r.loc:5} {r.nonblank:5} "
            f"{r.func_count:4} {r.max_func:4} {r.long_line_count:4}"
        )

    total_loc = sum(r.loc for r in reports)
    total_nb = sum(r.nonblank for r in reports)
    over_f = sum(1 for r in reports if r.over_file_limit)
    over_fn = sum(1 for r in reports if r.oversized_funcs)
    long_f = sum(1 for r in reports if r.long_line_count)

    print()
    print(
        f"files={len(reports)}  loc={total_loc}  nonblank={total_nb}  "
        f"over_file={over_f}  over_func_files={over_fn}  "
        f"long_line_files={long_f}"
    )
    print(
        f"limits: file<={FILE_LIMIT}  func<={FUNC_LIMIT}  "
        f"line<={LINE_LIMIT} chars"
    )

    print()
    print("=== OVERSIZED FILES ===")
    for r in reports:
        if r.over_file_limit:
            print(f"  +{r.loc - FILE_LIMIT:4}  {r.path}  ({r.loc} LOC)")

    print()
    print("=== OVERSIZED FUNCTIONS ===")
    rows = []
    for r in reports:
        for fn in r.oversized_funcs:
            rows.append((fn["lines"], r.path, fn))
    for lines, path, fn in sorted(rows, key=lambda x: -x[0]):
        print(
            f"  +{lines - FUNC_LIMIT:3}  {path}:{fn['start']}-{fn['end']}  "
            f"{fn['name']}() = {lines} lines"
        )


def to_markdown(reports: list[FileReport]) -> str:
    today = date.today().isoformat()
    total_loc = sum(r.loc for r in reports)
    total_nb = sum(r.nonblank for r in reports)
    violators = [r for r in reports if priority(r) != "OK"]

    lines = [
        "<!-- PRESERVATION RULE: Never delete or replace content. "
        "Append or annotate only. -->",
        "",
        "# Refactor Audit — Voxel Arena",
        "",
        f"**Generated**: {today}  ",
        f"**Source**: `python scripts/refactor_audit.py --md`  ",
        f"**Limits** (AGENTS.md): file <= {FILE_LIMIT} LOC · "
        f"function <= {FUNC_LIMIT} lines · line <= {LINE_LIMIT} chars",
        "",
        "> Re-run the script to refresh. Append new snapshots below older "
        "ones; do not delete prior audit history.",
        "",
        f"## Snapshot {today}",
        "",
        f"- Files audited: **{len(reports)}**",
        f"- Total LOC: **{total_loc}** (non-blank **{total_nb}**)",
        f"- Files over limit: "
        f"**{sum(1 for r in reports if r.over_file_limit)}**",
        f"- Files with oversized funcs: "
        f"**{sum(1 for r in reports if r.oversized_funcs)}**",
        f"- Files with long lines: "
        f"**{sum(1 for r in reports if r.long_line_count)}**",
        "",
        "### Priority key",
        "",
        "| Pri | Meaning |",
        "|-----|---------|",
        "| P0 | File >400 AND has funcs >50 |",
        "| P1 | File >400 only |",
        "| P2 | Func(s) >50 only |",
        "| P3 | Many long lines (>=10) |",
        "| OK | Within soft limits |",
        "",
        "### LOC by file",
        "",
        "| Pri | Path | LOC | Non-blank | Funcs | Max func | Long lines |",
        "|-----|------|----:|----------:|------:|---------:|-----------:|",
    ]

    for r in reports:
        lines.append(
            f"| {priority(r)} | `{r.path}` | {r.loc} | {r.nonblank} | "
            f"{r.func_count} | {r.max_func} | {r.long_line_count} |"
        )

    lines += ["", "### Refactor queue (violations only)", ""]
    if not violators:
        lines.append("_No size-limit violations._")
    else:
        lines.append(
            "| Pri | Path | Issue | Suggested split / action |"
        )
        lines.append(
            "|-----|------|-------|--------------------------|"
        )
        for r in violators:
            issues = []
            if r.over_file_limit:
                issues.append(f"file {r.loc} LOC (+{r.loc - FILE_LIMIT})")
            if r.oversized_funcs:
                top = sorted(
                    r.oversized_funcs, key=lambda f: -f["lines"]
                )[:3]
                names = ", ".join(
                    f"`{f['name']}()` {f['lines']}L" for f in top
                )
                issues.append(f"funcs: {names}")
            if r.long_line_count >= 10:
                issues.append(f"{r.long_line_count} lines >{LINE_LIMIT}ch")
            action = suggest_action(r)
            lines.append(
                f"| {priority(r)} | `{r.path}` | "
                f"{'; '.join(issues)} | {action} |"
            )

    lines += ["", "### Oversized functions (detail)", ""]
    rows = []
    for r in reports:
        for fn in r.oversized_funcs:
            rows.append((fn["lines"], r.path, fn))
    if not rows:
        lines.append("_None._")
    else:
        lines.append("| Lines | Location | Function |")
        lines.append("|------:|----------|----------|")
        for n, path, fn in sorted(rows, key=lambda x: -x[0]):
            lines.append(
                f"| {n} | `{path}:{fn['start']}-{fn['end']}` | "
                f"`{fn['name']}()` |"
            )

    lines += [
        "",
        "### Notes",
        "",
        "- Function sizes are brace-heuristic (not a full JS parser). "
        "Nested/class methods may under/over-count — verify before splitting.",
        "- CSS/HTML are included for LOC awareness; function checks apply "
        "to `.js` only.",
        "- Do not silent-refactor outside an active task; log tempting "
        "splits in SCRATCHPAD → Out-of-Scope Observations.",
        "",
    ]
    return "\n".join(lines)


def suggest_action(r: FileReport) -> str:
    p = r.path.lower()
    if "main.js" in p:
        return "Extract combat/hit-test, pause, spawn into helpers"
    if "ui.js" in p:
        return "Split menus / HUD / settings bindings"
    if "botmanager" in p:
        return "Keep lifecycle; move spawn/team helpers out"
    if "botbrain" in p:
        return "Keep FSM lean; extract state handlers"
    if "botmovement" in p:
        return "Split seek / path / collision helpers"
    if "player.js" in p:
        return "Extract damage/death/respawn or look helpers"
    if "glock" in p:
        return "Split model build vs fire/reload audio"
    if "style.css" in p:
        return "Split SpecOps menu / HUD / modal sections"
    if "index.html" in p:
        return "Extract modal/menu markup fragments if growing"
    if r.oversized_funcs:
        top = sorted(r.oversized_funcs, key=lambda f: -f["lines"])[0]
        return f"Extract `{top['name']}()` helpers"
    return "Split by responsibility when next touching file"


def main() -> int:
    parser = argparse.ArgumentParser(description="Voxel Arena refactor audit")
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    parser.add_argument(
        "--md",
        metavar="PATH",
        help="Write / prepend markdown report to PATH",
    )
    parser.add_argument(
        "--fail",
        action="store_true",
        help="Exit 1 if any P0–P2 violation",
    )
    args = parser.parse_args()

    reports = run_audit()

    if args.json:
        print(json.dumps([asdict(r) for r in reports], indent=2))
    else:
        print_table(reports)

    if args.md:
        md_path = Path(args.md)
        if not md_path.is_absolute():
            md_path = ROOT / md_path
        new_block = to_markdown(reports)
        md_path.parent.mkdir(parents=True, exist_ok=True)
        if md_path.exists():
            old = md_path.read_text(encoding="utf-8")
            # Preserve history: keep prior full docs under a retained section
            md_path.write_text(
                new_block
                + "\n---\n\n## Prior snapshots (retained)\n\n"
                + old,
                encoding="utf-8",
            )
        else:
            md_path.write_text(new_block, encoding="utf-8")
        print(f"\nWrote {md_path.relative_to(ROOT).as_posix()}")

    if args.fail:
        bad = [r for r in reports if priority(r) in {"P0", "P1", "P2"}]
        return 1 if bad else 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
