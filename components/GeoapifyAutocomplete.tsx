import React, { useState, useEffect, useRef } from "react";

interface GeoapifyAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

interface Suggestion {
    formatted: string;
}

export const GeoapifyAutocomplete: React.FC<GeoapifyAutocompleteProps> = ({ value, onChange, placeholder }) => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        if (!inputValue) {
            setSuggestions([]);
            setError(null);
            return;
        }
        const controller = new AbortController();
        const fetchSuggestions = async () => {
            setLoading(true);
            setError(null);
            try {
                const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
                if (!apiKey) {
                    setError("Geoapify API key missing");
                    setSuggestions([]);
                    return;
                }
                // Bucuresti + Ilfov bounding box: rect:minLon,minLat,maxLon,maxLat
                // Example: rect:25.9300,44.3200,26.3300,44.6000
                const filter = "rect:25.9300,44.3200,26.3300,44.6000";
                const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(inputValue)}&format=json&limit=5&filter=${filter}&apiKey=${apiKey}`;
                const res = await fetch(url, { signal: controller.signal });
                if (!res.ok) {
                    setError("Eroare la interogarea Geoapify");
                    setSuggestions([]);
                    return;
                }
                const data = await res.json();
                setSuggestions(data.results || []);
            } catch (e) {
                setError("Eroare la interogarea Geoapify");
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };
        const timeout = setTimeout(fetchSuggestions, 300);
        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [inputValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        setShowDropdown(true);
        onChange(e.target.value);
    };

    const handleSelect = (suggestion: Suggestion) => {
        setInputValue(suggestion.formatted);
        setShowDropdown(false);
        onChange(suggestion.formatted);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <textarea
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring resize-none min-h-[40px]"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                autoComplete="off"
                onFocus={() => setShowDropdown(true)}
                rows={2}
            />
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-10 left-0 right-0 bg-white border rounded shadow mt-1 max-h-56 overflow-auto">
                    {suggestions.map((s, idx) => (
                        <div
                            key={idx}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSelect(s)}
                        >
                            {s.formatted}
                        </div>
                    ))}
                </div>
            )}
            {showDropdown && loading && (
                <div className="absolute z-10 left-0 right-0 bg-white border rounded shadow mt-1 px-3 py-2 text-gray-500">Caută...</div>
            )}
            {error && (
                <div className="absolute z-10 left-0 right-0 bg-white border rounded shadow mt-1 px-3 py-2 text-red-500">{error}</div>
            )}
        </div>
    );
};

export default GeoapifyAutocomplete; 