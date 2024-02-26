const media = {};

const types = {
    image() { return { res: new Image(), event: "load" }; },
    audio() { return { res: new Audio(), event: "canplaythrough" }; }
};

export default async function loadMedia(resources, callback) {
    let loaded = 0;

    for (let resource of resources) {
        if (!media[resource.type]) media[resource.type] = {};
        const { res, event } = types[resource.type]?.();
        res.addEventListener(event, () => {
            if (++loaded >= resources.length) callback?.(media);
        }, { once: true });
        res.src = resource.path;
        media[resource.type][resource.name] = res;
    }

    return media;
}