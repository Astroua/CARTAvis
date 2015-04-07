/**
 * Command to display a window at full screen size.
 */

qx.Class.define("skel.Command.Window.CommandWindowMaximize", {
    extend : skel.Command.Command,
    type : "singleton",
    
    /**
     * Constructor.
     */
    construct : function() {
        this.base( arguments, "Maximize", null );
    },
    
    events : {
        "windowMaximized" : "qx.event.type.Data"
    },
    
    members : {
        
        doAction : function( vals, undoCB ){
            if ( skel.Command.Command.m_activeWins.length > 0 ){
                this.fireDataEvent( "windowMaximized", "");
                for ( var i = 0; i < skel.Command.Command.m_activeWins.length; i++ ){
                    var window = skel.Command.Command.m_activeWins[i];
                    window.fireDataEvent("maximizeWindow", window);
                    window.maximize();
                }
            }
        },
        
        getToolTip : function(){
            return "Maximize the selected window.";
        }
    }
});