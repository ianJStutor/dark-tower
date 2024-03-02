const media = {};

const types = {
    image() { return { res: new Image(), event: "load" }; },
    audio() { return { res: new Audio(), event: "canplaythrough" }; }
};

export default async function loadMedia(resources, callback) {
    Promise.all(
        resources.map(({ type, path, name }) => new Promise( (resolve, reject) => {
            if (!media[type]) media[type] = {};
            const { res, event } = types[type]?.();
            res.addEventListener(event, resolve, { once: true });
            res.addEventListener("error", reject, { once: true });
            res.src = path;
            media[type][name] = res;
        }))
    )
    .then(() => callback?.())
    .catch(console.error);
    return media;
}