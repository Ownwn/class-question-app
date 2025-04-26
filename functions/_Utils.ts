export function validateUrl(url: string): string {
    let endpoint = new URL(url).pathname

    if (endpoint.startsWith("/")) {
        endpoint = endpoint.substring(1, endpoint.length);
    }
    if (endpoint.endsWith("/")) {
        endpoint = endpoint.substring(0, endpoint.length - 1);
    }

    return endpoint;
}

export async function isUserValid(context) {
    return checkAuth(context, "user_authentication", await context.env.USER_AUTH);
}

export async function isAdminValid(context) {
    return checkAuth(context, "admin_authentication", await context.env.ADMIN_AUTH);
}

function checkAuth(context: EventContext<any, any, any>, cookieName: string, expectedAuth: string) {
    const value = getAuthCookie(context, cookieName);
    if (!value) {
        return false;
    }
    return value === expectedAuth;
}

export function getAuthCookie(context, target: string) {
    const cookies = context.request.headers.get("cookie");
    if (!cookies) {
        return undefined;
    }

    for (const cookie of cookies.split(";")) {
        const [name, value] = cookie.trim().split("=");
        if (name === target) {
            return value;
        }
    }

    return undefined;
}

export async function gameIsRunning(context) {
    const running = await context.env.RATE_LIMIT.get("running");
    return running === "true"
}