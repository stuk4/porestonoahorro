export const getPathOrOriginal = (inputString: string) => {
    try {
        const urlObj = new URL(inputString);
        const ruta = urlObj.pathname + urlObj.search + urlObj.hash;
        return ruta.substring(1); // Elimina el primer carácter '/'
    } catch (e) {
        // Si no es una URL válida, simplemente retorna el string original
        return inputString;
    }
};
