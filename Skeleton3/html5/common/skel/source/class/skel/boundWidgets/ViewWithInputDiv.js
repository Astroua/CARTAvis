/**
 * Created by pfederl on 04/01/15.
 *
 * Wrapped View widget... with an invisible widget (aka <div>) placed over top to
 * allow capture of input events (mouse,touch,key,etc).
 *
 * \note In desktop we could attach input listeners directly to the View, but on server side
 * this is controlled by PureWeb. So wrapping it this way avoids this issue altogether.
 */

qx.Class.define( "skel.boundWidgets.ViewWithInputDiv", {

    extend: qx.ui.container.Composite,

    /**
     * Constructor
     */
    construct: function( viewName) {
        this.base( arguments);

        this.setLayout( new qx.ui.layout.Grow());
        this.m_viewWidget = new skel.boundWidgets.View( viewName);
        this.add( this.m_viewWidget);
        this.m_overlayWidget = new qx.ui.core.Widget();
        this.add( this.m_overlayWidget);

        // this.m_overlayWidget.setBackgroundColor( "rgba(255,0,0,0.2)");
    },

    members: {

        m_overlayWidget: null,
        m_viewWidget: null,

        /**
         * Get the overlay widget
         */
        overlayWidget: function()
        {
            return this.m_overlayWidget;
        },

        /**
         * Get the view widget
         */
        viewWidget: function()
        {
            return this.m_viewWidget;
        }
    }

});
