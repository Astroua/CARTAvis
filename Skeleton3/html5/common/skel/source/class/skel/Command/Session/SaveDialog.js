/**
 * Dialog for saving state.
 */

/*global mImport */
/*******************************************************************************
 * @ignore( mImport)
 ******************************************************************************/
qx.Class.define("skel.Command.Session.SaveDialog", {
    extend : qx.ui.core.Widget,

    /**
     * Constructor.
     */
    construct : function( ) {
        this.base(arguments);

        var nameContainer = new qx.ui.container.Composite();
        nameContainer.setLayout(new qx.ui.layout.HBox(2));
        var nameLabel = new qx.ui.basic.Label( "Save Name:");
        nameContainer.add( new qx.ui.core.Spacer(1), {flex:1});
        nameContainer.add(nameLabel);
        this.m_saveText = new qx.ui.form.TextField();
        this.m_saveText.setValue( this.m_DEFAULT_SAVE );
        skel.widgets.TestID.addTestId( this.m_saveText, "snapshotSaveName");
        nameContainer.add( this.m_saveText);
        nameContainer.add( new qx.ui.core.Spacer(1), {flex:1});
        
        var path = skel.widgets.Path.getInstance();
        var checkContainer = new qx.ui.container.Composite();
        checkContainer.setLayout( new qx.ui.layout.VBox(2));
        this.m_layoutCheck = new qx.ui.form.CheckBox(path.STATE_LAYOUT);
        this.m_layoutCheck.setValue( true );
        this.m_preferencesCheck = new qx.ui.form.CheckBox(path.STATE_PREFERENCES);
        //this.m_preferencesCheck.setValue( true );
        this.m_allCheck = new qx.ui.form.CheckBox(path.STATE_SESSION);
        this.m_allCheck.addListener( "changeValue", function(){
            saveAll = this.m_allCheck.getValue();
            if ( saveAll ){
                this.m_layoutCheck.setEnabled( false );
                this.m_layoutCheck.setValue( true );
                this.m_preferencesCheck.setEnabled( false );
                this.m_preferencesCheck.setValue( true );
            }
            else {
                this.m_layoutCheck.setEnabled( true );
                this.m_preferencesCheck.setEnabled( true );
            }
        }, this );
        checkContainer.add( this.m_allCheck );
        var subCheckContainer1 = new qx.ui.container.Composite();
        subCheckContainer1.setLayout( new qx.ui.layout.HBox(2));
        subCheckContainer1.add( new qx.ui.core.Spacer(20));
        subCheckContainer1.add( this.m_preferencesCheck );
        subCheckContainer1.add( new qx.ui.core.Spacer(20), {flex:1});
        var subCheckContainer2 = new qx.ui.container.Composite();
        subCheckContainer2.setLayout( new qx.ui.layout.HBox(2));
        subCheckContainer2.add( new qx.ui.core.Spacer(20));
        subCheckContainer2.add( this.m_layoutCheck );
        subCheckContainer2.add( new qx.ui.core.Spacer(20), {flex:1});
        
        var descriptContainer = new qx.ui.container.Composite();
        descriptContainer.setLayout( new qx.ui.layout.VBox(2));
        var labelContainer = new qx.ui.container.Composite();
        labelContainer.setLayout( new qx.ui.layout.HBox(2));
        var descriptLabel = new qx.ui.basic.Label( "Description:");
        labelContainer.add( descriptLabel );
        labelContainer.add( new qx.ui.core.Spacer(20), {flex:1});
        descriptContainer.add( labelContainer );
        this.m_descriptArea = new qx.ui.form.TextArea();
        descriptContainer.add( this.m_descriptArea );
        
        checkContainer.add( subCheckContainer1);
        checkContainer.add( subCheckContainer2);
        var butContainer = new qx.ui.container.Composite();
        butContainer.setLayout( new qx.ui.layout.HBox(5));
        butContainer.add( new qx.ui.core.Spacer(1), {flex:1});
        var closeButton = new qx.ui.form.Button( "Close");
        closeButton.addListener( "execute", function(){
            this.fireDataEvent("closeSessionSave", "");
        }, this);
        
        var saveButton = new qx.ui.form.Button( "Save");
        saveButton.addListener( "execute", function(){
            var path = skel.widgets.Path.getInstance();
            var cmd = path.getCommandSaveState();
            var fileName = this.m_saveText.getValue();
            var description = this.m_descriptArea.getValue();
            if ( description === null ){
                description = "";
            }
            var saveLayout = this.m_layoutCheck.getValue();
            var savePreferences = this.m_preferencesCheck.getValue();
            var saveData = this.m_allCheck.getValue();
            var connector = mImport("connector");
            var params = "fileName:"+fileName+",layoutSnapshot:"+saveLayout+
                ",preferencesSnapshot:"+savePreferences+",dataSnapshot:"+saveData+",description:"+description;
            connector.sendCommand( cmd, params, function(val){} );
        }, this );
        butContainer.add( saveButton );
        butContainer.add( closeButton );
        
        this._setLayout( new qx.ui.layout.VBox(2));
        this._add( nameContainer );
        this._add( checkContainer );
        this._add( descriptContainer );
        this._add( butContainer );
       
    },

    events : {
        "closeSessionSave" : "qx.event.type.Data"
    },

    members : {
        m_DEFAULT_SAVE : "session_default",
        m_layoutCheck : null,
        m_preferencesCheck : null,
        m_descriptArea : null,
        m_allCheck : null,
        m_saveText : null
    },

    properties : {
        appearance : {
            refine : true,
            init : "popup-dialog"
        }

    }

});
