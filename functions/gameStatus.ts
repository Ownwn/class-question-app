import {isAdminValid} from "./_Utils";

export async function onRequest(context: EventContext<any, any, any>) {
    if (!await isAdminValid(context)) {
        return new Response(null, {
            status: 401
        });
    }

    const running = await context.env.RATE_LIMIT.get("running");

    return new Response(running, {
        status: 200
    });

}