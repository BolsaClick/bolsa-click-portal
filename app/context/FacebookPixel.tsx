import Head from "next/head"

const MetaFacebook = () => {
  return (
    <Head>
      <script id="facebook-pixel-script">{`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '3830716730578943');
fbq('track', 'PageView');`}</script>
      <noscript id="facebook-pixel-image">{`https://www.facebook.com/tr?id=3830716730578943&ev=PageView&noscript=1`}</noscript>
    </Head>
  )
}

export default MetaFacebook
