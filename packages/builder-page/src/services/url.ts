import { pick, extend } from "lodash";

const link = document.createElement("a"); // the only way to get an instance of Location class
link.id="steedosPageServiceUrlLink";
// add to document to apply <base> href
link.style.display = "none";

const initLink = ()=>{
  if(document.body && document.body.appendChild){
    if(!document.getElementById("steedosPageServiceUrlLink")){
      document.body.appendChild(link);
    }
  }
}

const fragmentProps = ["origin", "protocol", "host", "hostname", "port", "pathname", "search", "hash", "href"];

export function parse(url) {
  initLink()
  link.setAttribute("href", url);
  return pick(link, fragmentProps);
}

export function stringify(fragments) {
  initLink()
  extend(link, pick(fragments, fragmentProps));
  return link.href; // absolute URL
}

export function normalize(url) {
  initLink()
  link.setAttribute("href", url);
  return link.href; // absolute URL
}

export default { parse, stringify, normalize };
