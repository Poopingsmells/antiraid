const searchBar = document.getElementById("search_value");
searchBar.addEventListener("keydown", function (event) {
  if (event.code == "Enter") {
    window.location = `/search?q=${searchBar.value}`;
  }
});
$("body").on("keyup", function (event) {
  if (event.key === "Enter") {
    window.location = `/search?q=${searchBar.value}`;
  }
});
$("#search_value").bind("keyup", function () {
  const searchBox = $("#search_value");
  const searchTerm = searchBox.val();
  if (searchTerm) {
    $.ajax({
      url: `/search/bar?q=${searchTerm}`,
      type: "get",
      responseType: "json",
      success: function (res) {
        if (res.guild_users) {
          const bots = [];
          const max = res.bots.length > 9 ? 9 : res.guild_users.length;
          for (let i = 0; i < max; i++) {
            bots.push(`
<div class="result">
<a href="/user/${
              x.userID
            }"><img style="border-radius: 60px; width: 90px; height: 90px;" src="https://cdn.discordapp.com/avatars/${
              x.userID
            }/${
              bot.users.cache.get(x.userID).avatar
            }.webp" alt=" Profile Picture "></a>
<hr>
<p><strong>${bot.users.cache.get(x.userID).tag} (${
              x.nick || "Not set nickname"
            })</strong></p>
<hr>
<br>
<a href="https://discord.com/users/${
              x.userID
            }" class="button users"><i class="fa fa-vcard"></i> Discord</a>
<a href="/user/${
              x.userID
            }" class="button users"><i class="fa fa-eye"></i> View</a>
<br>
</div>
`);
          }
          $("#output").html(bots.join(""));
        }
      },
    });
  } else {
    $("#output").html("");
  }
});
