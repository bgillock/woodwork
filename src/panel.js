var Panels = []
class Panel {
    constructor(container, state) {
        container.getElement().html( '<div id=\"' + state.div + '\"></div>' );
        container.title = state.div;
        container.setTitle(state.div)
        Panels.push(container)
        //container.getElement().addEventListener('onresize', onAssemblyResize, false)
    }
}