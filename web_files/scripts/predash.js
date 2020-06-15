async function main () {
  console.log('Ready');

  if (!localStorage.pkgfnd_token) {
    console.error('No token');
    window.location = 'http://localhost:8080';
    return;
  }

  const dashdat = await axios.get('http://localhost:8080/user/dashboard',
    {
      headers: {
        Authorization: `Bearer ${localStorage.pkgfnd_token}`
      }
    });

  //console.log(dashdat);

  $('body').html(dashdat.data);
}

main();
