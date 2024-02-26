const media = {};

const types = {
    image() { return new Image() },
    audio() { return new Audio(); }
};

export default async function loadMedia(resources) {
    let loaded = 0;

    for (let resource of resources) {
        if (!media[resource.type]) media[resource.type] = {};
        const r = types[resource.type]?.();
        r.onload = () => media[resource.type][resource.name].loaded = true;
        r.canplay = () => media[resource.type][resource.name].loaded = true;
        r.src = resource.path;
        media[resource.type][resource.name] = {
            loaded: false,
            path: resource.path,
            resource: r
        };
    }

    return media;
}