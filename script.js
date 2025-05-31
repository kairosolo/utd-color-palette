// Color conversion utilities
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;

    if (diff !== 0) {
        switch (max) {
            case r:
                h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / diff + 2) / 6;
                break;
            case b:
                h = ((r - g) / diff + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

// Tooltip management
class ColorTooltip {
    constructor() {
        this.tooltip = document.getElementById('color-tooltip');
        this.hexElement = document.getElementById('hex-value');
        this.rgbElement = document.getElementById('rgb-value');
        this.hsvElement = document.getElementById('hsv-value');
        this.notification = document.getElementById('copy-notification');
        this.isVisible = false;
    }

    show(x, y, hexColor) {
        const rgb = hexToRgb(hexColor);
        if (!rgb) return;

        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

        // Update tooltip content
        this.hexElement.textContent = hexColor.toUpperCase();
        this.rgbElement.textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        this.hsvElement.textContent = `${hsv.h}°, ${hsv.s}%, ${hsv.v}%`;

        // Position tooltip
        this.tooltip.style.left = `${x + 15}px`;
        this.tooltip.style.top = `${y - 10}px`;

        // Show tooltip
        this.tooltip.classList.add('visible');
        this.isVisible = true;

        // Adjust position if tooltip goes off screen
        this.adjustPosition();
    }

    hide() {
        this.tooltip.classList.remove('visible');
        this.isVisible = false;
    }

    adjustPosition() {
        const rect = this.tooltip.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Adjust horizontal position
        if (rect.right > windowWidth - 10) {
            const currentLeft = parseInt(this.tooltip.style.left);
            this.tooltip.style.left = `${currentLeft - (rect.right - windowWidth + 20)}px`;
        }

        // Adjust vertical position
        if (rect.bottom > windowHeight - 10) {
            const currentTop = parseInt(this.tooltip.style.top);
            this.tooltip.style.top = `${currentTop - rect.height - 20}px`;
        }

        // Ensure tooltip doesn't go off the left edge
        if (rect.left < 10) {
            this.tooltip.style.left = '10px';
        }

        // Ensure tooltip doesn't go off the top edge
        if (rect.top < 10) {
            this.tooltip.style.top = '10px';
        }
    }

    showCopyNotification() {
        this.notification.classList.add('show');
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 2000);
    }
}

// Copy to clipboard function
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    const tooltip = new ColorTooltip();
    const colorBoxes = document.querySelectorAll('.color-box');

    colorBoxes.forEach(colorBox => {
        const hexColor = colorBox.getAttribute('data-color');

        // Mouse enter event
        colorBox.addEventListener('mouseenter', function(e) {
            tooltip.show(e.pageX, e.pageY, hexColor);
        });

        // Mouse move event
        colorBox.addEventListener('mousemove', function(e) {
            if (tooltip.isVisible) {
                tooltip.show(e.pageX, e.pageY, hexColor);
            }
        });

        // Mouse leave event
        colorBox.addEventListener('mouseleave', function() {
            tooltip.hide();
        });

        // Click event for copying
        colorBox.addEventListener('click', async function() {
            const hexWithoutHash = hexColor.substring(1); // Remove the # symbol
            const success = await copyToClipboard(hexWithoutHash);
            
            if (success) {
                tooltip.showCopyNotification();
            }
        });
    });

    // Hide tooltip when scrolling
    window.addEventListener('scroll', function() {
        tooltip.hide();
    });

    // Hide tooltip when window is resized
    window.addEventListener('resize', function() {
        tooltip.hide();
    });
});