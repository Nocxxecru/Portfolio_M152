const FILESIZE_MAX = 3145728;
const MEDIA_PATH = "./assets/upload/";
const AJAX_PATH = "../App/php/";

$(document).ready(() => {
  let pageName = window.location.pathname.substring(
    location.pathname.lastIndexOf("/") + 1
  );

  if (pageName == "index.php" || pageName == "") {
    GetPosts();
  }

  $("#btnSendPosts").click(sendPost);
});

/**
 * @author Hoarau Nicolas
 * @date 30.01.2020
 *
 * @brief Fonction qui permet d'envoyer un post
 *
 * @param event
 *
 * @version : 1.0.0
 */
function sendPost(event) {
  if (event) {
    event.preventDefault();
  }

  let formdata = new FormData();

  let content = $("#postText").val();
  formdata.append("postText", content);

  for (let x = 0; x < document.getElementById("inputImg").files.length; x++) {
    let file = document.getElementById("inputImg").files[x];

    if (file["size"] < FILESIZE_MAX) {
      formdata.append("medias[]", file);
    } else {
      console.log("trop gros");
    }
  }

  for (let x = 0; x < document.getElementById("inputAudio").files.length; x++) {
    let file = document.getElementById("inputAudio").files[x];
    formdata.append("medias[]", file);
  }

  for (let x = 0; x < document.getElementById("inputVideo").files.length; x++) {
    let file = document.getElementById("inputVideo").files[x];
    formdata.append("medias[]", file);
  }

  $.ajax({
    type: "post",
    url: AJAX_PATH + "sendPosts.php",

    // pour l'upload de fichier
    contentType: false,
    processData: false,

    data: formdata,
    dataType: "json",
    success: () => {
      window.location.href = "./index.php";
    }
  });
}

/**
 * @author Hoarau Nicolas
 * @date 20.02.2020
 *
 * @brief Fonction qui récupère les posts dans la base de données via ajax
 */
function GetPosts() {
  $.ajax({
    type: "post",
    url: AJAX_PATH + "getPosts.php",
    dataType: "json",
    success: data => {
      ShowPosts(data);
    }
  });
}

/**
 * @author Hoarau Nicolas
 * @date 20.02.2020
 *
 * @brief Fonction qui affiche les posts
 *
 * @param {array} posts tableau des posts reçu via la fonction GetPost
 */
function ShowPosts(posts) {
  let html = "";

  $.each(posts, (index, post) => {
    html += `<div class="container" id="${post.idPost}"><p id="postText">${post.comment}</p> <input type="text" value="${post.comment}" id="modify">`;

    if (post.medias != null) {
      let medias = post.medias.split(",");
      let types = post.types.split(",");

      for (let i = 0; i < medias.length; i++) {
        if (types[i] == "image/png" || types[i] == "image/jpeg") {
          html += `<img id="imgPosts" src="${MEDIA_PATH +
            medias[i]}" alt="uploaded image"><br>`;
        } else if (types[i] == "audio/mpeg") {
          html += `<audio controls> <source src="${MEDIA_PATH +
            medias[i]}" type="${types[i]}"></audio><br>`;
        } else if (types[i] == "video/mp4") {
          html += `<video loop autoplay muted controls> <source src="${MEDIA_PATH +
            medias[i]}" type="${types[i]}"></video><br>`;
        }
      }
    }
    html += `<div class="btn-group">
              <button type="button" class="btn btn-light" onclick="ModifyPost($(this)) ">Modifier</button>
              <button type="button" id="btnDelete" class="btn btn-danger" onclick="DeletePost($(this).closest('.container').attr('id'));">Supprimer</button>
            </div>
          </div>
          <hr>`;
  });
  $("#posts").html(html);
}

/**
 * @author Hoarau Nicolas
 * @date 03.03.2020
 *
 * @brief Fonction qui supprime le post choisis
 *
 * @param {int} idPost id du post à supprimer
 */
function DeletePost(idPost) {
  $.ajax({
    type: "post",
    url: AJAX_PATH + "deletePost.php",
    data: { idPost: idPost },
    dataType: "json",
    success: () => {
      window.location.href = "./index.php";
    }
  });
}

/**
 * @author Hoarau Nicolas
 * @date 02.03.2020
 * 
 * @brief Fonction qui affiche les modifications faites
 * 
 * @param {*} button 
 * 
 * @version : 1.0.0
 */
function ModifyPost(button) {
  button.hide();

  let closestButtonCopenant = button.closest(".container");
  let postText = closestButtonCopenant.children().closest("#postText")[0].textContent;
  let btnValidate = $(`<button class="btn btn-primary" onclick="ValidateModification()" id="btnValidate">Valider</button>`);
  let btnCancel = $(`<button class="btn btn-secondary" onclick="CancelModification($(this))">Annuler</button>`);

  if (postText != "") {
    closestButtonCopenant.prepend(`<input type="text" value="${postText}">`);
    $("#postText").hide();
  }

  // Récupère la source de chaque image dans le .container du bouton cliqué
  let imgSrc = button.closest('.container').children('img').map(function () {
    return $(this).attr('src')
  }).get()

  button.closest(".btn-group").append(btnValidate);
  button.closest(".btn-group").prepend(btnCancel);
}

function ValidateModification() {
  console.log("oui");
}

/**
 * @author Hoarau Nicolas
 * @date 09.03.2020
 * 
 * @brief Fonction qui annule les modifications faites
 * 
 * @param {*} button 
 * 
 * @version : 1.0.0
 */
function CancelModification(button) {
  button.hide();

  button.closest('.btn-group').children().closest('.btn-primary').hide();
  button.closest('.btn-group').children().closest('.btn-light').show();
  button.closest(".container").children()[0].style.display = "none";
  $('#postText').show();
  console.log(button);
}