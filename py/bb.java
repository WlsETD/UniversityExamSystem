import java.util.*;

public class bb {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int kwh = sc.nextInt();
        int cost = 0;
        if (kwh <= 100)
            cost = kwh * 5;
        else if (kwh <= 200)
            cost = 100 * 5 + (kwh - 100) * 7;
        else
            cost = 100 * 5 + 100 * 7 + (kwh - 200) * 10;
        System.out.print(cost);
    }
}
