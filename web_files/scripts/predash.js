async function main () {
  console.log('Ready');

  if (!localStorage.pkgfnd_token) {
    console.error('No token');
    window.location = 'https://www.packagefiend.com';
    return;
  }

  const dashdat = await axios.get('https://www.packagefiend.com/user/dashboard',
    {
      headers: {
        Authorization: `Bearer ${localStorage.pkgfnd_token}`
      }
    });

  //console.log(dashdat);

  $('body').html(dashdat.data);
}

main();
