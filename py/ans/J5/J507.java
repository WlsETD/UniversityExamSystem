import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int p = 1;
        int i = 1;
        while (i <= n) {
            p *= i;
            i++;
        }
        System.out.print(p);
    }
}
