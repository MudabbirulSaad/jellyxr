declare module '*.wasm' {
    const value: string;
    export default value;
}

declare module '*.mp4' {
    const value: string;
    export default value;
}

declare module '*.glb' {
    const value: string;
    export default value;
}

declare module '*.png' {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any;
    export = value;
}

declare module '*.scss' {
    // style imports are handled by the bundler
    const value: string;
    export default value;
}

declare module '*.woff2' {
    const value: string;
    export default value;
}
