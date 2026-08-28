import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  brazilCityStateOrNull,
  brazilianLocationOrNull,
  convertStateToUf,
  isBrazilCountry,
  isBrazilianUf,
  isForbiddenGeoCity,
} from './brazil-location'

describe('brazilianLocationOrNull', () => {
  it('accepts a Brazilian IP payload', () => {
    const loc = brazilianLocationOrNull({
      city: 'Campinas',
      region: 'São Paulo',
      regionCode: 'SP',
      country: 'Brasil',
      countryCode: 'BR',
    })
    assert.deepEqual(loc, {
      city: 'Campinas',
      region: 'SP',
      country: 'Brasil',
      countryCode: 'BR',
    })
  })

  it('rejects Washington DC (US datacenter / foreign IP)', () => {
    assert.equal(
      brazilianLocationOrNull({
        city: 'Washington',
        region: 'District of Columbia',
        regionCode: 'DC',
        country: 'United States',
        countryCode: 'US',
      }),
      null,
    )
  })

  it('rejects DC even if country is missing (do not default to BR)', () => {
    assert.equal(
      brazilianLocationOrNull({
        city: 'Washington',
        region: 'DC',
        countryCode: '',
      }),
      null,
    )
  })

  it('rejects US city when countryCode was wrongly defaulted away but region is DC', () => {
    assert.equal(
      brazilianLocationOrNull({
        city: 'Washington',
        region: 'DC',
        country: 'Brasil',
        countryCode: 'BR',
      }),
      null,
    )
  })

  it('rejects Mountain View / CA crawler IPs', () => {
    assert.equal(
      brazilianLocationOrNull({
        city: 'Mountain View',
        regionCode: 'CA',
        country: 'United States',
        countryCode: 'US',
      }),
      null,
    )
  })

  it('returns null when city is empty', () => {
    assert.equal(
      brazilianLocationOrNull({
        city: '',
        region: 'SP',
        countryCode: 'BR',
      }),
      null,
    )
  })

  it('rejects Washington even when UF was mapped to DF', () => {
    assert.equal(
      brazilianLocationOrNull({
        city: 'Washington',
        region: 'DF',
        countryCode: 'BR',
      }),
      null,
    )
  })
})

describe('brazilCityStateOrNull (form / URL write gate)', () => {
  it('accepts Belo Horizonte / MG', () => {
    assert.deepEqual(brazilCityStateOrNull('Belo Horizonte', 'MG'), {
      city: 'Belo Horizonte',
      state: 'MG',
    })
  })

  it('rejects Washington / DC so Pedagogia+BH cannot pick it up', () => {
    assert.equal(brazilCityStateOrNull('Washington', 'DC'), null)
    assert.equal(brazilCityStateOrNull('Washington', 'DF'), null)
    assert.equal(isForbiddenGeoCity('Washington - DC'), true)
  })

  it('rejects empty city or missing UF', () => {
    assert.equal(brazilCityStateOrNull('', 'MG'), null)
    assert.equal(brazilCityStateOrNull('Belo Horizonte', ''), null)
    assert.equal(brazilCityStateOrNull('BH', null), null)
  })
})

describe('isBrazilCountry / isBrazilianUf', () => {
  it('recognizes BR / Brasil / Brazil', () => {
    assert.equal(isBrazilCountry('BR'), true)
    assert.equal(isBrazilCountry('', 'Brasil'), true)
    assert.equal(isBrazilCountry('', 'Brazil'), true)
    assert.equal(isBrazilCountry('US', 'United States'), false)
  })

  it('treats DC as a non-Brazilian UF', () => {
    assert.equal(isBrazilianUf('DC'), false)
    assert.equal(isBrazilianUf('DF'), true)
    assert.equal(isBrazilianUf('SP'), true)
  })

  it('maps estado names to UF without accepting DC', () => {
    assert.equal(convertStateToUf('São Paulo'), 'SP')
    assert.equal(convertStateToUf('Distrito Federal'), 'DF')
    assert.equal(convertStateToUf('DC'), 'DC')
    assert.equal(isBrazilianUf(convertStateToUf('DC')), false)
  })
})
