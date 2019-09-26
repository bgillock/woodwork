var Panels = []
class Panel {
    constructor(container, state) {
        container.getElement().html( '<div class=\"ctrlcontainer\"><div class=\"right\" id=\"'+state.div+'ctrl\"></div><div class=\"left\" id=\"'+state.div+'\"></div></div>');
        container.title = state.div;
        container.setTitle(state.div)
        Panels.push(container)
        //container.getElement().addEventListener('onresize', onAssemblyResize, false)
    }
}