
const $ = require('space-pen').$,
      View = require('space-pen').View;

module.exports = class ResizablePanel extends View {

    constructor(...args) {

        super(...args);

        this.resizeStarted = this.resizeStarted.bind(this);
        this.resizeStopped = this.resizeStopped.bind(this);
        this.resizeTo = this.resizeTo.bind(this);
    }

    static content(param){
        return this.div(() => {
            this.div({outlet: 'scroller'}, () => {
                return this.subview('content', param.item);
            });
            return this.div({outlet: 'handle'});
        });
    }

    initialize(param){

        this.position = param.position || 'bottom';
        this.vertical = (this.position === 'left') || (this.position === 'right');

        if (this.vertical) { this.minWidth = 50; }
        if (!this.vertical) { this.minHeight = 50; }

        this.handle.on('mousedown', e => this.resizeStarted(e));

        this.css({
            position: 'relative',
            overflow: 'hidden',
            width: this.vertical ? param.item.width : '100%',
            height: !this.vertical ? param.item.height : '100%',
            'z-index': 2
        });

        this.scroller.css({
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow: 'auto'
        });

        this.handle.css({
            width: this.vertical ? '10px' : '100%',
            height: !this.vertical ? '10px' : '100%',
            left: !this.vertical || (this.position === 'right') ? 0 : undefined,
            right: this.position === 'left' ? 0 : undefined,
            top: this.vertical || (this.position === 'bottom') ? 0 : undefined,
            bottom: this.position === 'top' ? 0 : undefined,
            cursor: this.vertical ? 'col-resize' : 'row-resize',
            position: 'absolute',
            'z-index': 3
        });

        param.item = this;
        this.panel = (() => { switch (this.position) {
            case 'bottom': return atom.workspace.addBottomPanel(param);
            case 'top':return atom.workspace.addTopPanel(param);
            case 'left':return atom.workspace.addLeftPanel(param);
            case 'right':return atom.workspace.addRightPanel(param);
        } })();

        // workaround for https://discuss.atom.io/t/ugly-scrollbars-bug/1027
        this.css({display: 'inline-block'});
        return setTimeout(() => this.css({display: 'block'}));
    }

    destroy() {
        return this.panel.destroy();
    }

    resizeStarted() {
        this.focusElement = document.activeElement;
        $(document).on('mousemove', this.resizeTo);
        return $(document).on('mouseup', this.resizeStopped);
    }

    resizeStopped() {
        $(document).off('mousemove', this.resizeTo);
        $(document).off('mouseup', this.resizeStopped);
        if (this.focusElement) {
            this.focusElement.focus();
        }
        return this.focusElement = null;
    }

    resizeTo({pageX, pageY}) {
        switch (this.position) {
            case 'left': return this.width(Math.max(this.minWidth, pageX));
            case 'right':return this.width(Math.max(this.minWidth, $(document.body).width() - pageX));
            case 'top':   return this.height(Math.max(this.minHeight, pageY));
            case 'bottom':return this.height(Math.max(this.minHeight, $(document.body).height() - pageY));
        }
    }
};