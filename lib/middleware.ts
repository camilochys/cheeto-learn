import { verifyToken } from "@/lib/auth";

export function verifyAuth(request: Request) {
    // --- GET THE AUTHORIZATION HEADER AND SPLIT IT TO GET THE TOKEN ---
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    // --- IF THERE IS NO TOKEN, RETURN AN ERROR WITH STATUS 401 (UNAUTHORIZED) ---
    if(!token){
        return { error: "No autorizado.", status: 401 };
    }

    // --- TRY TO VERIFY THE TOKEN AND RETURN THE PAYLOAD, IF IT FAILS, RETURN AN ERROR WITH STATUS 401 (UNAUTHORIZED) ---
    try {
        const payload = verifyToken(token);
        return { payload };
    } catch {
        return { error: "Token inválido.", status: 401 };
    }   
}
