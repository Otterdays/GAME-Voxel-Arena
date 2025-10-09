// Custom UI Components for Voxel Arena
// These components match the game's aesthetic and work properly with the custom cursor

export class CustomDropdown {
    constructor(container, options, currentValue, onChange) {
        this.container = container;
        this.options = options;
        this.currentValue = currentValue;
        this.onChange = onChange;
        this.isOpen = false;
        
        this.createDropdown();
        this.setupEventListeners();
    }
    
    createDropdown() {
        // Clear container
        this.container.innerHTML = '';
        
        // Create dropdown wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('custom-dropdown');
        
        // Create display button
        this.displayButton = document.createElement('button');
        this.displayButton.classList.add('custom-dropdown-button');
        this.displayButton.innerHTML = `
            <span class="dropdown-text">${this.getCurrentText()}</span>
            <span class="dropdown-arrow">▼</span>
        `;
        
        // Create options container
        this.optionsContainer = document.createElement('div');
        this.optionsContainer.classList.add('custom-dropdown-options');
        this.optionsContainer.style.display = 'none';
        
        // Create option buttons
        this.options.forEach(option => {
            const optionButton = document.createElement('button');
            optionButton.classList.add('custom-dropdown-option');
            optionButton.textContent = option.text;
            optionButton.dataset.value = option.value;
            
            if (option.value === this.currentValue) {
                optionButton.classList.add('selected');
            }
            
            optionButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectOption(option.value);
            });
            
            this.optionsContainer.appendChild(optionButton);
        });
        
        this.wrapper.appendChild(this.displayButton);
        this.wrapper.appendChild(this.optionsContainer);
        this.container.appendChild(this.wrapper);
    }
    
    getCurrentText() {
        const currentOption = this.options.find(opt => opt.value === this.currentValue);
        return currentOption ? currentOption.text : this.currentValue;
    }
    
    selectOption(value) {
        this.currentValue = value;
        this.displayButton.querySelector('.dropdown-text').textContent = this.getCurrentText();
        
        // Update selected state
        this.optionsContainer.querySelectorAll('.custom-dropdown-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.value === value) {
                option.classList.add('selected');
            }
        });
        
        this.close();
        if (this.onChange) {
            this.onChange(value);
        }
    }
    
    open() {
        this.isOpen = true;
        this.optionsContainer.style.display = 'block';
        this.displayButton.classList.add('open');
    }
    
    close() {
        this.isOpen = false;
        this.optionsContainer.style.display = 'none';
        this.displayButton.classList.remove('open');
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    setupEventListeners() {
        this.displayButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.close();
            }
        });
        
        // Handle keyboard navigation
        this.displayButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });
    }
    
    updateOptions(newOptions) {
        this.options = newOptions;
        this.createDropdown();
        this.setupEventListeners();
    }
    
    setValue(value) {
        this.currentValue = value;
        this.displayButton.querySelector('.dropdown-text').textContent = this.getCurrentText();
        
        // Update selected state
        this.optionsContainer.querySelectorAll('.custom-dropdown-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.value === value) {
                option.classList.add('selected');
            }
        });
    }
}

export class CustomSlider {
    constructor(container, min, max, step, currentValue, onChange, formatValue) {
        this.container = container;
        this.min = min;
        this.max = max;
        this.step = step;
        this.currentValue = currentValue;
        this.onChange = onChange;
        this.formatValue = formatValue || ((val) => val);
        this.isDragging = false;
        
        this.createSlider();
        this.setupEventListeners();
    }
    
    createSlider() {
        // Clear container
        this.container.innerHTML = '';
        
        // Create slider wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('custom-slider');
        
        // Create track
        this.track = document.createElement('div');
        this.track.classList.add('custom-slider-track');
        
        // Create fill (shows current value)
        this.fill = document.createElement('div');
        this.fill.classList.add('custom-slider-fill');
        
        // Create thumb
        this.thumb = document.createElement('div');
        this.thumb.classList.add('custom-slider-thumb');
        
        // Create value display
        this.valueDisplay = document.createElement('span');
        this.valueDisplay.classList.add('custom-slider-value');
        this.valueDisplay.textContent = this.formatValue(this.currentValue);
        
        this.track.appendChild(this.fill);
        this.track.appendChild(this.thumb);
        this.wrapper.appendChild(this.track);
        this.wrapper.appendChild(this.valueDisplay);
        this.container.appendChild(this.wrapper);
        
        this.updateSlider();
    }
    
    updateSlider() {
        const percentage = ((this.currentValue - this.min) / (this.max - this.min)) * 100;
        this.fill.style.width = `${percentage}%`;
        this.thumb.style.left = `${percentage}%`;
        this.valueDisplay.textContent = this.formatValue(this.currentValue);
    }
    
    getValueFromPosition(x) {
        const rect = this.track.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
        const rawValue = this.min + percentage * (this.max - this.min);
        
        // Snap to step
        const steppedValue = Math.round(rawValue / this.step) * this.step;
        return Math.max(this.min, Math.min(this.max, steppedValue));
    }
    
    setValue(value) {
        this.currentValue = Math.max(this.min, Math.min(this.max, value));
        this.updateSlider();
        if (this.onChange) {
            this.onChange(this.currentValue);
        }
    }
    
    setupEventListeners() {
        // Mouse events
        this.track.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isDragging = true;
            const newValue = this.getValueFromPosition(e.clientX);
            this.setValue(newValue);
        });
        
        this.thumb.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.isDragging = true;
        });
        
        // Global mouse events
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const newValue = this.getValueFromPosition(e.clientX);
                this.setValue(newValue);
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        // Keyboard events
        this.wrapper.addEventListener('keydown', (e) => {
            let newValue = this.currentValue;
            
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowDown':
                    e.preventDefault();
                    newValue = Math.max(this.min, this.currentValue - this.step);
                    break;
                case 'ArrowRight':
                case 'ArrowUp':
                    e.preventDefault();
                    newValue = Math.min(this.max, this.currentValue + this.step);
                    break;
                case 'Home':
                    e.preventDefault();
                    newValue = this.min;
                    break;
                case 'End':
                    e.preventDefault();
                    newValue = this.max;
                    break;
            }
            
            if (newValue !== this.currentValue) {
                this.setValue(newValue);
            }
        });
        
        // Make focusable
        this.wrapper.setAttribute('tabindex', '0');
    }
}

// Helper function to create formatted value functions
export function createValueFormatter(format) {
    switch (format) {
        case 'percentage':
            return (val) => Math.round(val * 100) + '%';
        case 'integer':
            return (val) => Math.round(val).toString();
        case 'decimal':
            return (val) => val.toFixed(2);
        case 'fps':
            return (val) => Math.round(val) + ' FPS';
        case 'units':
            return (val) => Math.round(val) + ' units';
        default:
            return (val) => Math.round(val * 100) + '%';
    }
}
