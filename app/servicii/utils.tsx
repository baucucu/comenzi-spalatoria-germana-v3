// Remove Romanian diacritics for search
export function removeDiacritics(text: string): string {
    return text
        .toLowerCase()
        .replace(/ă/g, "a")
        .replace(/â/g, "a")
        .replace(/î/g, "i")
        .replace(/ș/g, "s")
        .replace(/ț/g, "t")
        .replace(/ş/g, "s") // alternative encoding
        .replace(/ţ/g, "t") // alternative encoding
}

// Check if search term matches text (diacritics-insensitive)
export function matchesSearch(text: string, searchTerm: string): boolean {
    return removeDiacritics(text).includes(removeDiacritics(searchTerm))
}
