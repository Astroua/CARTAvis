/**
 * A window that displays the value of /hacks/cursor
 *
 * This is a temporary widget just to test cursor display.
 *
 * @ignore( mImport)
 */

/*global mImport */

qx.Class.define( "skel.boundWidgets.CursorWindow", {
    extend: qx.ui.window.Window,

    construct: function() {
        this.base( arguments, "Cursor");
        this.addListener( "minimize", this._userHidWindow.bind(this));
        this.addListener( "close", this._userHidWindow.bind(this));

        this.m_connector = mImport( "connector");
        this.m_cursorVisible = this.m_connector.getSharedVar( "/hacks/cursorVisible");
        this.m_cursorText = this.m_connector.getSharedVar( "/hacks/cursorText");
        this.m_cursorText.addCB( this._cursorTextCB.bind(this));
        this.m_cursorVisible.addCB( this._visibleCB.bind(this));

        this.setLayout( new qx.ui.layout.Grow);
        this.m_htmlArea = new qx.ui.embed.Html();
        this.m_htmlArea.set({ selectable: false });
        this.add( this.m_htmlArea);

        this.setMinWidth( 100);
        this.setMinHeight( 100);
        this.setAlwaysOnTop( true);
        this._visibleCB( this.m_cursorVisible.get());
        this._cursorTextCB( this.m_cursorText.get());
    },

    members: {

        _visibleCB: function(val) {
            var visible = val === "1";
            if( visible) {
                this.show();
            }
            else{
                this.hide();
            }
        },

        _userHidWindow: function() {
            this.m_cursorVisible.set( "0");
        },

        _cursorTextCB: function(val) {
            this.m_htmlArea.setHtml( val);
        },

        m_connector: null,
        m_cursorText: null,
        m_cursorVisible: null,
        m_htmlArea: null
    }

});