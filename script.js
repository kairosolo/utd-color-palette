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

        this.hexElement.textContent = hexColor.toUpperCase();
        this.rgbElement.textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        this.hsvElement.textContent = `${hsv.h}°, ${hsv.s}%, ${hsv.v}%`;

        this.tooltip.style.left = `${x + 15}px`;
        this.tooltip.style.top = `${y - 10}px`;

        this.tooltip.classList.add('visible');
        this.isVisible = true;

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

        if (rect.right > windowWidth - 10) {
            const currentLeft = parseInt(this.tooltip.style.left);
            this.tooltip.style.left = `${currentLeft - (rect.right - windowWidth + 20)}px`;
        }

        if (rect.bottom > windowHeight - 10) {
            const currentTop = parseInt(this.tooltip.style.top);
            this.tooltip.style.top = `${currentTop - rect.height - 20}px`;
        }

        if (rect.left < 10) {
            this.tooltip.style.left = '10px';
        }

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

class DescriptionTooltip {
    constructor() {
        this.tooltip = document.getElementById('description-tooltip');
        this.textElement = document.getElementById('description-text');
        this.isVisible = false;
    }

    show(x, y, description) {
        this.textElement.textContent = description;

        this.tooltip.style.left = `${x + 15}px`;
        this.tooltip.style.top = `${y - 10}px`;

        this.tooltip.classList.add('visible');
        this.isVisible = true;

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

        if (rect.right > windowWidth - 10) {
            const currentLeft = parseInt(this.tooltip.style.left);
            this.tooltip.style.left = `${currentLeft - (rect.right - windowWidth + 20)}px`;
        }

        if (rect.bottom > windowHeight - 10) {
            const currentTop = parseInt(this.tooltip.style.top);
            this.tooltip.style.top = `${currentTop - rect.height - 20}px`;
        }

        if (rect.left < 10) {
            this.tooltip.style.left = '10px';
        }

        if (rect.top < 10) {
            this.tooltip.style.top = '10px';
        }
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
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

document.addEventListener('DOMContentLoaded', function() {
    const colorTooltip = new ColorTooltip();
    const descriptionTooltip = new DescriptionTooltip();
    const colorBoxes = document.querySelectorAll('.color-box');

    colorBoxes.forEach(colorBox => {
        const hexColor = colorBox.getAttribute('data-color');
        const description = colorBox.getAttribute('data-description');
        const infoIcon = colorBox.querySelector('.info-icon');

        colorBox.addEventListener('mouseenter', function(e) {
            if (!e.target.classList.contains('info-icon')) {
                colorTooltip.show(e.pageX, e.pageY, hexColor);
            }
        });

        colorBox.addEventListener('mousemove', function(e) {
            if (colorTooltip.isVisible && !e.target.classList.contains('info-icon')) {
                colorTooltip.show(e.pageX, e.pageY, hexColor);
            }
        });

        colorBox.addEventListener('mouseleave', function(e) {
            if (!e.relatedTarget || !colorBox.contains(e.relatedTarget)) {
                colorTooltip.hide();
            }
        });

        if (infoIcon) {
            infoIcon.addEventListener('mouseenter', function(e) {
                e.stopPropagation();
                colorTooltip.hide(); 
                descriptionTooltip.show(e.pageX, e.pageY, description);
            });

            infoIcon.addEventListener('mousemove', function(e) {
                e.stopPropagation();
                if (descriptionTooltip.isVisible) {
                    descriptionTooltip.show(e.pageX, e.pageY, description);
                }
            });

            infoIcon.addEventListener('mouseleave', function(e) {
                e.stopPropagation();
                descriptionTooltip.hide();
            });
        }

        colorBox.addEventListener('click', async function(e) {
            if (!e.target.classList.contains('info-icon')) {
                const hexWithoutHash = hexColor.substring(1); 
                const success = await copyToClipboard(hexWithoutHash);
                
                if (success) {
                    colorTooltip.showCopyNotification();
                }
            }
        });
    });

    window.addEventListener('scroll', function() {
        colorTooltip.hide();
        descriptionTooltip.hide();
    });

    window.addEventListener('resize', function() {
        colorTooltip.hide();
        descriptionTooltip.hide();
    });
});