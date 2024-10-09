export const extractToken = (header: string) : string | null => {
    const [prefix, token]  = header.split(' ')
    const prefixes = ['Basic', 'Bearer']
    
    if(!prefixes.includes(prefix)) return null

    return token
}