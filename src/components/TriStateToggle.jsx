import { useRef } from 'react';
import { Minus, Check, X } from 'lucide-react';

export default function TriStateToggle({ value, onChange, label }) {
    // value can be true, false, or null/undefined

    const handleClick = () => {
        if (value === true) {
            onChange(false);
        } else if (value === false) {
            onChange(null);
        } else {
            onChange(true);
        }
    };

    // Determine position class
    let positionClass = 'tristate-toggle--null';
    if (value === true) positionClass = 'tristate-toggle--true';
    if (value === false) positionClass = 'tristate-toggle--false';

    return (
        <div className="tristate-wrapper" onClick={handleClick}>
            <div className={`tristate-toggle ${positionClass}`}>
                <div className="tristate-toggle__knob">
                    {value === true && <Check size={12} strokeWidth={3} />}
                    {value === false && <X size={12} strokeWidth={3} />}
                    {(value === null || value === undefined) && <Minus size={12} strokeWidth={3} />}
                </div>
                <div className="tristate-toggle__track">
                    <div className="track-slot track-slot--false"></div>
                    <div className="track-slot track-slot--null"></div>
                    <div className="track-slot track-slot--true"></div>
                </div>
            </div>
            {label && <span className="tristate-label">{label}</span>}
        </div>
    );
}
