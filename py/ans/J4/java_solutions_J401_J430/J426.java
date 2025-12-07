import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt(), y = sc.nextInt(), z = sc.nextInt();
        int mid = (x > y ? (x < z ? x : (y > z ? y : z))
                         : (y < z ? y : (x > z ? x : z)));
        System.out.print(mid);
    }
}
