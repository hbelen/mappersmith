import { lowerCaseObjectKeys, assign } from './utils'

/**
 * @param {Request} originalRequest
 * @param {Integer} responseStatus
 * @param {String} responseData
 * @param {Object} responseHeaders, defaults to an empty object ({})
 */
function Response(originalRequest, responseStatus, responseData, responseHeaders) {
  this.originalRequest = originalRequest
  this.responseStatus = responseStatus
  this.responseData = responseData
  this.responseHeaders = responseHeaders || {}
  this.timeElapsed = null
}

Response.prototype = {
  /**
   * @return {Request}
   */
  request() {
    return this.originalRequest
  },

  /**
   * @return {Integer}
   */
  status() {
    // IE sends 1223 instead of 204
    if (this.responseStatus === 1223) {
      return 204
    }

    return this.responseStatus
  },

  /**
   * Returns true if status is greater or equal 200 or lower than 400
   *
   * @return {Boolean}
   */
  success() {
    const status = this.status()
    return status >= 200 && status < 400
  },

  /**
   * Returns an object with the headers. Header names are converted to
   * lowercase
   *
   * @return {Object}
   */
  headers() {
    return lowerCaseObjectKeys(this.responseHeaders)
  },

  rawData() {
    return this.responseData
  },

  /**
   * Returns the response data, if "Content-Type" is "application/json"
   * it parses the response and returns an object
   *
   * @return {String|Object}
   */
  data() {
    let data = this.responseData

    if (this.isContentTypeJSON()) {
      try { data = JSON.parse(this.responseData) }
      catch(e) {}
    }

    return data
  },

  isContentTypeJSON() {
    return /application\/json/.test(this.headers()['content-type'])
  },

  /**
   * Enhances current Response returning a new Response
   *
   * @param {Object} extras
   *   @param {Integer} extras.status - it will replace the current status
   *   @param {String} extras.rawData - it will replace the current rawStatus
   *   @param {Object} extras.headers - it will be merged with current headers
   *
   * @return {Response}
   */
  enhance(extras) {
    return new Response(
      this.request(),
      extras.status || this.status(),
      extras.rawData || this.rawData(),
      assign({}, this.headers(), extras.headers)
    )
  }
}

export default Response
