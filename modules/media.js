const media = {};

const types = {
    image() { return { res: new Image(), event: "onload" }; },
    audio() { return { res: new Audio(), event: "oncanplaythrough" }; }
};

export default async function loadMedia(resources, callback) {
    let loaded = 0;

    for (let resource of resources) {
        if (!media[resource.type]) media[resource.type] = {};
        const { res, event } = types[resource.type]?.();
        res[event] = () => {
            media[resource.type][resource.name].loaded = true;
            if (++loaded >= resources.length) callback?.(media);
        };
        res.src = resource.path;
        media[resource.type][resource.name] = {
            loaded: false,
            path: resource.path,
            resource: res
        };
    }

    return media;
}