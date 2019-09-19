const wtypes = [{
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
    },
    {
        name: "Black Cherry",
        topGrain: "textures/black-cherry-sealed.jpg",
        sideGrain: "textures/black-cherry-sealed.jpg",
        endGrain: "textures/black-cherry-endgrain-400x400.jpg"
    },
    {
        name: "Claro Walnut",
        topGrain: "textures/claro-walnut-sealed-wt.jpg",
        sideGrain: "textures/claro-walnut-sealed-wt.jpg",
        endGrain: "textures/claro-walnut-endgrain-wt-400x400.jpg"
    },
    {
        name: "Red Oak",
        topGrain: "textures/red-oak-sealed.jpg",
        sideGrain: "textures/red-oak-sealed.jpg",
        endGrain: "textures/red-oak-endgrain1-400x400.jpg"
    },
    {
        name: "White Oak",
        topGrain: "textures/white-oak-sealed.jpg",
        sideGrain: "textures/white-oak-sealed.jpg",
        endGrain: "textures/white-oak-endgrain1-400x400.jpg"
    },
    {
        name: "Yellow Poplar",
        topGrain: "textures/yellow-poplar-sealed-400x400.jpg",
        sideGrain: "textures/yellow-poplar-sealed-400x400.jpg",
        endGrain: "textures/yellow-poplar-endgrain-400x400.jpg"
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
const sizes = [
    {
        name: "6\"x1\"x96\"",
        l: 9600,
        h: 100,
        w: 600
    },
    {
        name: "3\"x1\"x6\"", //96
        l: 600,
        h: 100,
        w: 300
    },
    {
        name: "2\"x1\"x72\"",
        l: 7200,
        h: 100,
        w: 200
    },
    {
        name: "5-1/2\"x3/4\"x24\"",
        l: 2400,
        h: 75,
        w: 550
    },
    {
        name: "4\"x1\"x72\"",
        l: 7200,
        h: 100,
        w: 400
    },
    {
        name: "3\"x1\"x72\"",
        l: 7200,
        h: 100,
        w: 300
    },
    {
        name: "2\"x1\"x96\"",
        l: 9600,
        h: 100,
        w: 200
    }
]
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
   // console.log(c.text)
   // woodoptions.options.add(c);
    WoodTypes.push(new Wood(wtypes[i].name, wtypes[i].topGrain, wtypes[i].sideGrain, wtypes[i].endGrain))
}
var woodsizes = document.getElementById("woodsize");
for (var i = 0; i < sizes.length; i++) {
    var c = document.createElement("option");
    c.text = sizes[i].name;
   // console.log(c.text)
    // woodsizes.options.add(c);
}

