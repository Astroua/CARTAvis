/**
 * A display window specialized for controlling data animators.
 */
/*global mImport */
/*******************************************************************************
 * @ignore( mImport)
 
 ******************************************************************************/

qx.Class
        .define(
                "skel.widgets.Window.DisplayWindowAnimation",
                {
                    extend : skel.widgets.Window.DisplayWindow,

                    /**
                     * Constructor.
                     */
                    construct : function(row, col, index, detached ) {
                        this.base(arguments, skel.widgets.Path.getInstance().ANIMATOR, row, col, index, detached );
                        this.setLayout(new qx.ui.layout.VBox(5));
                        this.m_links = [];
                        this._initSupportedAnimations();
                    },

                    members : {
                        
                        
                        /**
                         * Callback for a state change; update the animators that are displayed.
                         */
                        _animationCB : function( ){
                            if ( this.m_sharedVar ){
                                var val = this.m_sharedVar.get();
                                if ( val ){
                                    try {
                                        var animObj = JSON.parse( val );
                                        this._showHideAnimation(animObj);
                                    }
                                    catch( err ){
                                        console.log( "Could not parse: "+val );
                                    }
                                }
                            }
                        },
                        
                        /**
                         * Add a callback to the main window shared variable to deal with animation
                         * related changes.
                         */
                        _initSharedVarAnim : function(){
                            this.m_sharedVar.addCB( this._animationCB.bind( this ));
                            this._animationCB();
                        },
                        
                        /**
                         * Get server side information about the list of all possible
                         * animators that are available.
                         */
                        _initSupportedAnimations : function(){
                            var path = skel.widgets.Path.getInstance();
                            this.m_sharedVarAnimations = this.m_connector.getSharedVar( path.ANIMATOR_TYPES );
                            this.m_sharedVarAnimations.addCB( this._sharedVarAnimationsCB.bind( this ));
                            this._sharedVarAnimationsCB();
                        },
                        
                        /**
                         * Initialize the window specific commands that are supported.
                         */
                        _initSupportedCommands : function(){
                            arguments.callee.base.apply(this, arguments);
                            var animCmd = skel.Command.Animate.CommandAnimations.getInstance();
                            this.m_supportedCmds.push( animCmd.getLabel() );
                        },
                        
                        /**
                         * Update the commands about which animation is visible..
                         */
                        updateCmds : function(){
                            var animAllCmd = skel.Command.Animate.CommandAnimations.getInstance();
                            if ( this.m_supportedAnimations !== null ){
                                for (var i = 0; i < this.m_supportedAnimations.length; i++) {
                                    var animId = this.m_supportedAnimations[i];
                                    var animCmd = animAllCmd.getCmd( animId );
                                    var visible = this.isVisible( animId );
                                    animCmd.setValue( visible );
                                }
                            }
                        },

                        
                        /**
                         * Set the appearance of this window based on whether or not it is selected.
                         * @param selected {boolean} true if the window is selected; false otherwise.
                         * @param multiple {boolean} true if multiple windows can be selected; false otherwise.
                         */
                        setSelected : function(selected, multiple) {
                            arguments.callee.base.apply(this, arguments, selected, multiple );
                            this.updateCmds();
                        },
                        
                        
                        /**
                         * Update the list of available animators from the server.
                         */
                        _sharedVarAnimationsCB : function( ){
                            var val = this.m_sharedVarAnimations.get();
                            if ( val ){
                                try {
                                    var animObj = JSON.parse( val );
                                    //Initialize the supported animations
                                    this.m_supportedAnimations = [];
                                    for (var i = 0; i < animObj.animators.length; i++ ){
                                        this.m_supportedAnimations[i] = animObj.animators[i];
                                    }
                                    //Update which animators should appear based on the state of this animator
                                    this._animationCB();
                                    
                                }
                                catch( err ){
                                    console.log( "Could not parse: "+val );
                                }
                            }
                        },
                        
                        /**
                         * Returns true if the animator widget with the given identifier is visible;
                         *      false otherwise.
                         * @param animId {String} an identifier for an animator.
                         * @return {boolean} true if the animator is visible; false otherwise.
                         */
                        isVisible : function( animId ){
                            var visible = false;
                            if ( this.m_animators !== null ){
                                if ( this.m_content.indexOf( this.m_animators[animId] ) >= 0 ){
                                    visible = true;
                                }
                            }
                            return visible;
                        },

                        
                        /**
                         * Adds or removes a specific animator from the display
                         * based on what the user has selected from the menu.
                         */
                        _showHideAnimation : function( animObj ) {
                            if ( this.m_animators === null ){
                                this.m_animators = {};
                            }
                            if ( this.m_supportedAnimations === null ){
                                return;
                            }
                            for (var i = 0; i < this.m_supportedAnimations.length; i++) {
                                var animId = this.m_supportedAnimations[i];
                                var animVisible = false;
                                var index = animObj.animators.indexOf( animId );
                                if ( index >= 0 ){
                                    animVisible = true;
                                }
                                var oldVisible = this.isVisible( animId );
                                if (animVisible) {
                                    if (this.m_animators[animId] === undefined ) {
                                        this.m_animators[animId] = new skel.boundWidgets.Animator(animId, this.m_identifier);
                                    }
                                      
                                    if ( !oldVisible) {
                                        this.m_content.add(this.m_animators[animId]);
                                    }
                                } 
                                else {
                                    if ( oldVisible ) {
                                        this.m_content.remove(this.m_animators[animId]);
                                    }
                                }
                            }
                        },
                        
                        /**
                         * Implemented to remove the title.
                         */
                        windowIdInitialized : function() {
                            arguments.callee.base.apply(this, arguments );
                            this._initSharedVarAnim();
                        },
                        
                        //Shared variable containing all animations.
                        m_sharedVarAnimations : null,
                        
                        //List of all animators that are available
                        m_supportedAnimations : null,
                        
                        //Tape deck widgets
                        m_animators : null
                    }

                });
