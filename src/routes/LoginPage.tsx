import {useState} from "react";
import {useFormStatus} from "react-dom";

export function LoginPage() {
    const [response, setResponse] = useState("");

    return <>
        <h2>Login is required (WIP)</h2>

        <form action={sendPassword}>
            <PasswordForm/>
        </form>

    </>;

    function PasswordForm() {
        const status = useFormStatus();
        return (
            <>
                <button type="submit">Submit password</button>
                <input type="password" required name="password" placeholder="Password"/>
                <p>{status.pending ? "Loading.." : response}</p>
            </>
        );
    }


    async function sendPassword(formData: any) {
        setResponse("Loading...");

        const res = await fetch("auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        setResponse(res.ok ? "Cookie set!" : "Fail");

    }
}