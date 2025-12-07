import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();
        int m = a;
        if (b > m) m = b;
        if (c > m) m = c;
        System.out.print(m);
    }
}
