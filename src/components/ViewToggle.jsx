export default function ViewToggle({ value, onChange, options }) {
    return (
        <div className="view-toggle" role="tablist">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    role="tab"
                    aria-selected={value === opt.value}
                    className={`view-toggle__option${value === opt.value ? ' view-toggle__option--active' : ''}`}
                    onClick={() => onChange(opt.value)}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}