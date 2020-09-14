const { red } = require('kleur')
const axios = require('axios')
const { utils } = require('dimer-vue')
const BASE_URL = 'http://localhost:5000'

/**
 * A mapping of zones and the template component they must use
 */
const ZONE_TEMPLATE_MAPPING = {
    guides: './src/templates/Guides.vue'
}

/**
 * We decided to stick to a single version for the docs. Every
 * major release can get it's own website (a copy of it) and
 * every minor release can have inline notes.
 */
const WEBSITE_VERSION = 'master'

/**
 * Returns an array of zones and their respective version. Each
 * zone has a single version only.
 */
async function getZones() {
    const { data } = await axios.get(`${ BASE_URL }/zones.json`)
    return data.map(({ name, slug, versions }) => {
        const component = ZONE_TEMPLATE_MAPPING[slug]
        const version = versions.find((version) => version.no === WEBSITE_VERSION)

        if ( ! component ) {
            throw new Error(
                `${ slug } doesn't have a component assigned to it. Open "frontend/api.js" to assign a component`,
            )
        }

        if ( ! version ) {
            throw new Error(`${ slug } must have a ${ WEBSITE_VERSION } in order to be compiled.`)
        }

        return {
            name: name,
            slug: slug,
            component,
            version,
        }
    })
}

/**
 * Returns a tree of categories and optionally their docs with complete
 * content.
 */
async function getZoneGroupsAndCategories(zoneSlug, versionNo, includeContent) {
    if ( ! zoneSlug || ! versionNo ) {
        throw new Error(
            `Cannot fetch categories. zoneSlug and versionNo are required.`
        )
    }

    const params = {}
    if ( includeContent ) {
        params.load_content = true
    }

    const { data } = await axios(`${ BASE_URL }/${ zoneSlug }/versions/${ versionNo }.json`, { params })
    const groups = []

    const categories = data.map((value, index) => {
      value.name = value.category;
      return value;
    })


    return [
        {
            name: 'Basics',
            categories
        }
    ]
}

/**
 * Returns the content for a doc
 */
async function getDoc(zoneSlug, versionNo, permalink) {
    if ( ! zoneSlug || ! versionNo || ! permalink ) {
        throw new Error(
            `Cannot fetch doc. "zoneSlug", "versionNo" and "permalink" are required.`
        )
    }

    const { data } = await axios(`${ BASE_URL }/${ zoneSlug }/versions/${ versionNo }/${ permalink }.json`)
    return data
}

/**
 *
 * @param zone
 * @param doc
 * @param groups {array}
 */
function getDocPageData(zone, doc, groups) {
    if ( ! zone ) {
        throw new Error('Make sure to define the zone when getting page data')
    }

    if ( ! zone.component ) {
        throw new Error('The zone must have a component property in order to generate page data')
    }

    /**
     * Extracting toc from the doc content
     */
    const toc = utils.extractNode(doc.content, (node) => {
        return node.tag === 'div'
            && node.props.className
            && node.props.className.includes('toc-container')
    })

    // const docGroup = groups.find(({ name }) => name === doc.group) || {}
    const docGroup = groups[0]

    return {
        path: `/${ doc.permalink }`,
        component: zone.component,
        context: {
            doc: {
                title: doc.title,
                content: doc.content,
                group: doc.group,
                permalink: doc.permalink,
            },
            toc: toc,
            groups: groups,
            under_progress: docGroup.under_progress,
            last_updated_on: docGroup.last_updated_on,
            categories: docGroup.categories,
        },
    }
}

module.exports = {
    getZones: getZones,
    getZoneGroupsAndCategories: getZoneGroupsAndCategories,
    getDoc: getDoc,
    getDocPageData: getDocPageData,
}
