export function createAlert(type, message) {
  const alertContainer = document.getElementById('alerts-container');

  // Check if the number of alerts exceeds 4
  if (alertContainer.childElementCount >= 4) {
      alertContainer.removeChild(alertContainer.firstChild);
  }

  // Create the alert element
  const alert = document.createElement('div');
  alert.className = `alert ${type} alert-dismissible fade show mt-3`;
  alert.setAttribute('role', 'alert');

  // Create the icon element
  const icon = document.createElement('div');
  icon.className = 'alert__icon';
  icon.innerHTML = getIcon(type);

  // Create the message text
  const text = document.createElement('div');
  text.className = 'alert__title';
  text.textContent = message;

  // Create the close button
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'alert__close';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.innerHTML = '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m19 6.41-1.41-1.41L12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#393a37"></path></svg>';
  closeButton.onclick = () => alert.remove();

  // Append text and close button to alert
  alert.appendChild(icon);
  alert.appendChild(text);
  alert.appendChild(closeButton);

  // Append alert to container
  alertContainer.appendChild(alert);
}

function getIcon(type) {
  switch (type) {
    case 'error':
      return `<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z" fill="#EF665B"></path></svg>`;
    case 'success':
      return `<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m12 1c-6.075 0-11 4.925-11 11s4.925 11 11 11 11-4.925 11-11-4.925-11-11-11zm4.768 9.14c.0878-.1004.1546-.21726.1966-.34383.0419-.12657.0581-.26026.0477-.39319-.0105-.13293-.0475-.26242-.1087-.38085-.0613-.11844-.1456-.22342-.2481-.30879-.1024-.08536-.2209-.14938-.3484-.18828s-.2616-.0519-.3942-.03823c-.1327.01366-.2612.05372-.3782.1178-.1169.06409-.2198.15091-.3027.25537l-4.3 5.159-2.225-2.226c-.1886-.1822-.4412-.283-.7034-.2807s-.51301.1075-.69842.2929-.29058.4362-.29285.6984c-.00228.2622.09851.5148.28067.7034l3 3c.0983.0982.2159.1748.3454.2251.1295.0502.2681.0729.4069.0665.1387-.0063.2747-.0414.3991-.1032.1244-.0617.2347-.1487.3236-.2554z" fill="#84D65A" fill-rule="evenodd"></path></svg>`;
    case 'info':
      return `<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 2c4.962 0 9 4.038 9 9s-4.038 9-9 9-9-4.038-9-9 4.038-9 9-9zm0 4a1 1 0 100 2 1 1 0 000-2zm1 4h-2v5h2v-5zm0 6h-2v2h2v-2z" fill="#3C78B5" fill-rule="evenodd"></path></svg>`;
    default:
      return '';
  }
}
