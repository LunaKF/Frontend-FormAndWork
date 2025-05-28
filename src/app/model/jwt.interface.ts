export interface IJwt {
    jti: string,   // ID único del token (JWT ID)
    email: string, // Email del usuario autenticado
    sub: string,   // Sujeto (subject) del token, normalmente el ID del usuario
    iss: string,   // Emisor del token (issuer), normalmente el servidor
    iat: number,   // Fecha de emisión del token (issued at), en formato UNIX (segundos)
    exp: number    // Fecha de expiración del token, en formato UNIX
    
    
    tipoUsuario: string; //para el getSessionTipoUsuario
}
