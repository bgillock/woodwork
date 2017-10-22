var wtypes = [{
        name: "Pine Flooring",
        topGrain: "textures/hardwood2_diffuse.jpg",
        sideGrain: "textures/hardwood2_diffuse.jpg",
        endGrain: "textures/hardwood2_diffuse.jpg"
    },
    {
        name: "Orange Agate",
        topGrain: "textures/orange-agate-sealed.jpg",
        sideGrain: "textures/orange-agate-sealed.jpg",
        endGrain: "textures/granadillo-endgrain.jpg"
    },
    {
        name: "Afrormosia",
        topGrain: "textures/afrormosia-sealed-jh.jpg",
        sideGrain: "textures/afrormosia-sealed-jh.jpg",
        endGrain: "textures/afrormosia-endgrain-jh.jpg"
    }
]
class Texture {
    constructor(filename) {
        this.texture = new THREE.TextureLoader().load(filename)
       // this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
       // this.texture.repeat.set(0.008, 0.008);
        this.material = new THREE.MeshPhongMaterial({
            //side: THREE.DoubleSide,
            map: this.texture,
            polygonOffset: true,
            polygonOffsetFactor: 1, // positive value pushes polygon further away
            polygonOffsetUnits: 1
        });
    }
}

class Wood {
    constructor(name, topgrain, sidegrain, endgrain) {
        this.name = name
        this.sides = []
        this.topGrain = new Texture(topgrain)
        this.sideGrain = new Texture(sidegrain)
        this.endGrain = new Texture(endgrain)
    }
}

var WoodTypes = []

var woodoptions = document.getElementById("woodtype");
for (var i = 0; i < wtypes.length; i++) {
    var c = document.createElement("option");
    c.text = wtypes[i].name;
    woodoptions.options.add(c, 1);
    WoodTypes.push(new Wood(wtypes[i].name, wtypes[i].topGrain, wtypes[i].sideGrain, wtypes[i].endGrain))
}