import java.util.*;

public class bb {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        int result = a + b * c - (a % b) - 1;
        System.out.print(result);
    }
}
