import { readDataFile } from "./utils.js";
import { log } from "./utils.js";

export async function verifyToken(token) {
    const users = await readDataFile('users.txt');
    const entry = users.find(user => user.token === token);

    if (!entry) {
        log(`El token usado no existe. El token es '${token}'.`, 'error')
        return false;
    }

    if (entry.used === 'true') {
        log(`Se ha intentado usar un enlace ya usado. El token es '${token}' y pertenece al usuario '${entry.username}'`, 'error')
        return false;
    }

    entry.used = true;
    return true;
}