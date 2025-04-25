export function validateUrl(url: string): string {
    const urls = ["https://class-question-app.pages.dev", "http://127.0.0.1:5173"];

    for (const urlStart of urls) {
        if (url.startsWith(urlStart)) {
            url = url.replace(urlStart, "");
            break;
        }
    }
    if (url.startsWith("/")) {
        url = url.substring(1, url.length);
    }
    if (url.endsWith("/")) {
        url = url.substring(0, url.length - 1);
    }

    return url;
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