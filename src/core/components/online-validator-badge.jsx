import React from "react"
import URL from "url-parse"

import PropTypes from "prop-types"
import { sanitizeUrl } from "core/utils"
import win from "core/window"

export default class OnlineValidatorBadge extends React.Component {
    static propTypes = {
      getComponent: PropTypes.func.isRequired,
      getConfigs: PropTypes.func.isRequired,
      specSelectors: PropTypes.object.isRequired
    }

    constructor(props, context) {
        super(props, context)
        let { getConfigs } = props
        let { validatorUrl } = getConfigs()
        this.state = {
            url: this.getDefinitionUrl(),
            validatorUrl: validatorUrl === undefined ? "https://online.swagger.io/validator" : validatorUrl,
            swaggerResponse: []
          }
    }

    getDefinitionUrl = () => {
      // TODO: test this behavior by stubbing `window.location` in an Enzyme/JSDom env
      let { specSelectors } = this.props

      const urlObject = new URL(specSelectors.url(), win.location)
      return urlObject.toString()
    }

    componentWillReceiveProps(nextProps) {
        let { getConfigs } = nextProps
        let { validatorUrl } = getConfigs()

        this.setState({
            url: this.getDefinitionUrl(),
            validatorUrl: validatorUrl === undefined ? "https://online.swagger.io/validator" : validatorUrl
        })
    }

    render() {
        let { getConfigs } = this.props
        let { spec } = getConfigs()

        let sanitizedValidatorUrl = sanitizeUrl(this.state.validatorUrl)

        if ( typeof spec === "object" && Object.keys(spec).length) return null

        if (!this.state.url || !this.state.validatorUrl || this.state.url.indexOf("localhost") >= 0
                            || this.state.url.indexOf("127.0.0.1") >= 0) {
          return null
        }

        return (<div style={{ float: "right"}}>
        <span>
                    <ValidatorImage root={`${ sanitizedValidatorUrl }`} url={`${ encodeURIComponent(this.state.url) }`} />
                    </span>
                    <span style={{ display:"block" }}>
                    <a target="_blank" aira-label="Validate (new window)" rel="noopener noreferrer" href={`${ sanitizedValidatorUrl }/debug?url=${ encodeURIComponent(this.state.url) }`} >
                    Validate
                </a>
                
            </span>
            </div>)  
    }
}


class ValidatorImage extends React.Component {
  static propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    root: PropTypes.string, /*ryan*/
    url: PropTypes.string /*ryan*/
  }

  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
      error: false,
      debugError: false,
      isLoaded: false,
      APIresult: []    
    }
  }

  componentDidMount() {
    const img = new Image()
    img.onload = () => {
      this.setState({
        loaded: true
      })
    }
    img.onerror = () => {
      this.setState({
        error: true
      })
    }
    /* img.src = this.props.src */
    img.src = this.props.root + "?url=" + this.props.url;


    fetch(this.props.root + "/debug?url=" + this.props.url)
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          isLoaded: true,
          APIresult: JSON.stringify(result)
      });
    },
    (error) => {
      this.setState({
        isLoaded: true,
        debugError: true
      })
    }
    )
  
  }

  componentWillReceiveProps(nextProps) {


    if (nextProps.root !== this.props.root || nextProps.url !== this.props.url) {
      const img = new Image()
      img.onload = () => {
        this.setState({
          loaded: true
        })
      }
      img.onerror = () => {
        this.setState({
          error: true
        })
      }
      img.src = nextProps.root + "?url=" + nextProps.url
    }
  }

 
  render() {

    if (this.state.error) {
      return <img alt={ "Error"} />
    } else if (!this.state.loaded) {
      return null
    }
    return <img src={this.props.root + "?url=" + this.props.url} alt={this.getAltText()} />
  }

    getAltText() {
      if (this.state.debugError == true)
      {
        return "Specification status unknown"
      }
      else
      if(this.state.APIresult.toString() == "{}")
        return "Specification file is valid"
      else
        return "Specification file is invalid"
    }

}