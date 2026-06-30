'use client'
import Script from 'next/script'

export function ReclameAquiSeal() {
  return (
    <div style={{ width: 142, height: 52, flexShrink: 0 }}>
      <div id="ra-verified-seal" />
      <Script
        id="ra-embed-verified-seal"
        src="https://s3.amazonaws.com/raichu-beta/ra-verified/bundle.js"
        data-id="S0puTUo3Q1RRMUhFVk5GVDpib2xzYS1jbGljaw=="
        data-target="ra-verified-seal"
        data-model="horizontal_3"
        strategy="lazyOnload"
      />
    </div>
  )
}
