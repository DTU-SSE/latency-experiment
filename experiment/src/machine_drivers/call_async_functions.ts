export async function runAsyncFunctions(functions: (() => Promise<void>)[]): Promise<void> {
    return Promise.all(functions.map(fun => fun())).then()
}