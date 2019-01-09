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

      {/* TODO: change image to 2 vars instead of 3 */}
        return (<span style={{ float: "right"}}>
                <a target="_blank" rel="noopener noreferrer" href={`${ sanitizedValidatorUrl }/debug?url=${ encodeURIComponent(this.state.url) }`} root={`${ sanitizedValidatorUrl }`} url={`${ encodeURIComponent(this.state.url) }`} >
                    <ValidatorImage src={`${ sanitizedValidatorUrl }?url=${ encodeURIComponent(this.state.url) }`} root={`${ sanitizedValidatorUrl }`} url={`${ encodeURIComponent(this.state.url) }`} />
                </a>
            </span>)  
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
    img.src = this.props.src


    /* ryan */
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
        error
      })
    }
    )
  
  }

  componentWillReceiveProps(nextProps) {


    if (nextProps.src !== this.props.src) {
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
      img.src = nextProps.src
    }
  }

 
  render() {

    if (this.state.error) {
      return <img alt={ "Error"} />
    } else if (!this.state.loaded) {
      return null
    }
    return <img src={this.props.src} alt={this.getAltText()} />
  }

    getAltText() {
      if(this.state.APIresult.toString() == "{}")
        return "Specification file is valid"
      else
        return "Specification file is invalid"
    }

}

      {/* TODO: get rid of this method */}
class ValidatorText extends React.Component {
  static propTypes = {
    src: PropTypes.string,
    root: PropTypes.string,
    url: PropTypes.string
  }
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      APIresult: []
    }
  }


componentDidMount(){
  /*fetch("https://online.swagger.io/validator/debug?url=https://gsa.github.io/prototype-city-pairs-api-documentation/api-docs/console/citypairs")*/
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
      error
    })
  }
  )
    

}

  render(){
    const {error, isLoaded, APIresult } = this.state;
      return(

<span>Loaded state: {isLoaded.toString()} - Result: {APIresult.toString()} - URL: {this.props.root + "/debug?url=" + this.props.url} - GetAltText: { this.getAltText() }</span>

      )
  }

  getAltText() {
    if(this.state.APIresult.toString() == "{}")
      return "Valid"
    else
      return "Invalid"
  }
}