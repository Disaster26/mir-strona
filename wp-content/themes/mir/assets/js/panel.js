/* Panel: wybór i usuwanie zdjęcia z biblioteki mediów (Treści strony, Instalacje) */
jQuery(function ($) {
  $(document).on('click', '.mir-wybierz', function (e) {
    e.preventDefault();
    var cel = $('#' + $(this).data('cel'));
    var box = $(this).closest('.mir-obraz');
    var ramka = wp.media({ title: 'Wybierz zdjęcie', button: { text: 'Użyj tego zdjęcia' }, library: { type: 'image' }, multiple: false });
    ramka.on('select', function () {
      var a = ramka.state().get('selection').first().toJSON();
      cel.val(a.id);
      var u = (a.sizes && a.sizes.medium) ? a.sizes.medium.url : a.url;
      box.find('.podglad').html($('<img alt="">').attr('src', u));
    });
    ramka.open();
  });
  $(document).on('click', '.mir-usun', function (e) {
    e.preventDefault();
    $('#' + $(this).data('cel')).val('');
    $(this).closest('.mir-obraz').find('.podglad').empty();
  });
});
