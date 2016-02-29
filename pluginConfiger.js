export default function(chatter) {

  this.onEnable = function() {
    console.log("PluginViewer Enabled!");
    var self = this;


    setup(this);
    // chatter.pluginManager.registerEvent(this, "AfterAuthEvent", function(event) {
    //   setup(self);
    // });


  };

  function setup(plugin) {
    var PluginsEnable = React.createClass({

      getInitialState: function() {
        return {
          plugins: chatter.pluginManager.getPlugins(),
        };
      },

      componentDidMount: function() {
        var self = this;

        chatter.listen(plugin, "ServerPluginList", function(plugins) {
          self.setState({
            plugins: [].concat(chatter.pluginManager.getPlugins()).concat(plugins),
          });
        });
        chatter.send("ServerPluginList", {});
        chatter.pluginManager.registerEvent(plugin, "PluginEnableEvent", function(event) {
          if(self.state.plugins.indexOf(event.plugin) === -1) {
            self.setState({
              plugins: self.state.plugins.concat(event.plugin),
            });
          }
          setTimeout(function() {
            self.setState({});
          });
        });
        chatter.pluginManager.registerEvent(plugin, "PluginDisableEvent", function(event) {
          setTimeout(function() {
            self.setState({});
          });
        });
      },

      pluginTick: function(plugin, event) {
        if(plugin instanceof Plugin) {
          //Client plugin handle within plugin manager
          if(event.target.checked) {
            chatter.pluginManager.enablePlugin(plugin);
          } else {
            chatter.pluginManager.disablePlugin(plugin);
          }
        } else {
          //Server plugin send event to server plugin
          chatter.send("PluginStateSwitch", {name: plugin.name});
        }
        this.setState({});
      },

      render: function() {
        var self = this;
        var id = 0;
        var pluginsList = this.state.plugins.map(function(plugin) {
          var createdId = uuid();
          return React.createElement("div", null,
            React.createElement("input", {type:"checkbox", className: "filled-in", id:createdId, checked: plugin.enabled , onChange: self.pluginTick.bind(null, plugin)}),
            React.createElement("label", {htmlFor:createdId}, plugin.name));
          });
          id = id + 1;
        return React.createElement("div", null, pluginsList);
      }

    });


    chatter.getPanel('right').addPage(plugin, new Page('pluginenable', 1, PluginsEnable));
  }


}
