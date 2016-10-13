$(document).ready(function() {
    $(document).ready(function() {
        var totalPrice = 0;

        $('.food').click(function() {
            var $frm = $(this).parent();
            var toAdd = $frm.children(".productInput").val();
            var addPrice = parseFloat($frm.children(".priceInput").val());
            var addAmount = parseFloat($frm.children(".amountInput").val());

            if ($('.priceInput').val() == '') {
                alert('Price can not be left blank');
            };
            if ($('.amountInput').val() == '') {
                alert('Amount can not be left blank');
            } else {

                var div = $("<div>");
                div.append("<p class='amount'>" + addAmount + "</p>", "<p class='product'> " + toAdd + " </p>", "<p class='price'>" + addPrice + "</p>", "<p class='delete'>" + "X" + "</p>");

                $frm.parent().children(".messages").append(div);

                totalPrice += addAmount * addPrice;
                var result = Math.round(totalPrice * 100) / 100;

                $(".totalPrice").text("Total Price: $" + result);
            }


            console.log(addAmount);
            console.log(addPrice);
        });


        $(document).on("click", ".delete", function() {

            $(this).closest("div").remove();
            console.log(subPrice);
            console.log(subAmount);
        });

        $(document).on("mouseover", ".delete", function() {
            var hoverAmount = parseFloat($(this).siblings(".amount").text());
            var hoverPrice = parseFloat($(this).siblings(".price").text());
            totalPrice -= hoverAmount * hoverPrice;
            var result = Math.round(totalPrice * 100) / 100;

            $(".totalPrice").text("Total Price: $" + result);

            $(this).closest("div").fadeTo("fast", 0.4);
        });
        $(document).on("mouseout", ".delete", function() {
            var subAmount = parseFloat($(this).siblings(".amount").text());
            var subPrice = parseFloat($(this).siblings(".price").text());
            totalPrice += subAmount * subPrice;
            var result = Math.round(totalPrice * 100) / 100;

            $(".totalPrice").text("Total Price: $" + result);


            $(this).closest("div").fadeTo("fast", 1.0);
        })





    });




});
