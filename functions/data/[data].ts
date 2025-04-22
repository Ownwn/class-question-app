export async function onRequest(context) {

    const url = validateUrl(context.request.url);
    if (!url) {
        return response("Bad request", 400);
    }
    if (!checkAuthorised(context)) {
        return response("Unauthorized", 401);
    }

    if (url === "add") {
        return await addQuestion(context);
    }
    if (url === "get") {
        return await getQuestion(context.env);
    }

    return response("Bad request", 400);
}

async function checkRateLimit(context) {
    const cookie = getAuthCookie(context);
    if (!cookie) {
        return false;
    }
    let timeout = parseInt(await context.env.RATE_LIMIT.get(cookie));
    if (!timeout || isNaN(timeout)) {
        context.env.RATE_LIMIT.put(cookie, Date.now());
        return false;
    }

    if (Date.now() - timeout > 5000) {
        context.env.RATE_LIMIT.put(cookie, Date.now());
        return true;
    }
    return false;
}

function response(content: string, status: number) {
    return new Response(content, {
        status: status
    });
}

async function createData(env) {
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS questions (id BIGINT PRIMARY KEY, value VARCHAR(500))").run();

    await env.DB.prepare("INSERT INTO questions VALUES (1, 'first question?')").run(); // todo delme
}

async function isDuplicate(context, question: string) {
    try {
        const numDupes = await context.env.DB
            .prepare("SELECT COUNT(*) as count FROM questions WHERE value = ?")
            .bind(question)
            .first();

        return numDupes.count >= 1;

    } catch (e) {
        console.error("Error checking for duplicate questions...", e);
        return true;
    }
}

async function addQuestion(context) {
    if (!await checkRateLimit(context)) {
        return response("Rate limited", 429);
    }

    const question = await parseQuestion(context);
    if (!question) {
        return response("Bad question", 400);

    }

    if (await isDuplicate(context, question)) {
        return response("Question already exists", 409);
    }

    try {
        //@ts-ignore
        const stmt = await context.env.DB
            .prepare("INSERT INTO questions VALUES (?, ?)")
            .bind(Date.now(), question) // todo better ID
            .run();

        return response("Added", 200);

    } catch (e) {
        return response("Error adding question", 500);
    }
}

async function parseQuestion(context) {
    const badChars = [" ", ";", "&", "*"];
    let question;
    try {
        const json = await context.request.json();
        question = json.question;
    } catch (e) {
        return undefined;
    }

    if (!question || badChars.some(char => question.indexOf(char) !== -1)) {
        return undefined;
    }

    return question;
}

async function getQuestion(env) {
    try {
        const stmt = env.DB
            .prepare("SELECT * FROM questions")
            .run();

        const { results } = await stmt;
        return response(JSON.stringify(results), 200);

    } catch (e) {
        await createData(env);
        return response("Creating data...", 500);
    }
}

function validateUrl(url: string) {

    const urls = ["https://purple-brook-3fec.ownwn.workers.dev/data", "http://127.0.0.1:8788/data"];

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

    if (!url || url.length === 0 || (url !== "get" && url !== "add")) {
        return undefined;
    }
    return url;
}


function checkAuthorised(context): boolean {
    const cookie = getAuthCookie(context);
    if (!cookie) {
        return false;
    }
    return cookie === context.env.AUTH;
}

function getAuthCookie(context) {
    const cookies = context.request.headers.get("cookie");
    if (!cookies) {
        return undefined;
    }

    for (const cookie of cookies.split(";")) {
        const [name, value] = cookie.trim().split("=");
        if (name === "authentication") {
            return value;
        }
    }

    return undefined;
}